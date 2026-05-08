// Thin message shell. Heavy lifting is in content/replace.js + content/adapters.js,
// loaded before this file (see manifest.json content_scripts order).

// Per-page undo memory: holds the original text + element reference + mode
// from the last successful REPLACE_IN_COMPOSER on this page. WeakRef so the
// reference doesn't keep DOM alive after navigation.
let __lastChange = null;

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  const R = globalThis.__SwitcherReplace;
  const A = globalThis.__SwitcherAdapters;
  if (!R || !A) {
    sendResponse({ ok: false, reason: "extension-not-loaded" });
    return;
  }

  if (msg?.type === "GET_SELECTION") {
    sendResponse({ text: getSelectionText(R) });
    return;
  }

  if (msg?.type === "GET_ADAPTER_INFO") {
    const adapter = A.pickAdapter(msg.override);
    let editableId = null;
    try {
      const el = adapter.getEditable();
      if (el) editableId = el.tagName?.toLowerCase() || null;
    } catch {}
    sendResponse({
      id: adapter.id,
      hostname: location.hostname,
      hasEditable: !!editableId,
      editableTag: editableId,
      canUndo: canUndo(),
    });
    return;
  }

  if (msg?.type === "REPLACE_SELECTION") {
    const ok = legacyReplaceSelection(R, msg.text);
    sendResponse({ ok });
    return;
  }

  if (msg?.type === "SHOW_TOAST") {
    showToast(msg.text || "Done", msg.kind || "ok", {
      result: msg.result,
      copyLabel: msg.copyLabel,
      copiedLabel: msg.copiedLabel,
    });
    sendResponse({ ok: true });
    return;
  }

  if (msg?.type === "UNDO_REPLACE") {
    const r = undoLastChange(R);
    sendResponse(r);
    return;
  }

  if (msg?.type === "REPLACE_IN_COMPOSER") {
    handleReplaceInComposer(R, A, msg).then(sendResponse).catch((e) => {
      sendResponse({ ok: false, reason: "exception", error: String(e?.message ?? e) });
    });
    return true; // async sendResponse
  }
});

async function handleReplaceInComposer(R, A, msg) {
  const adapter = A.pickAdapter(msg.override);
  const el = adapter.getEditable();
  if (!el) return { ok: false, reason: "composer-not-found", adapter: adapter.id };

  let mode;
  if (R.isInputLike(el)) {
    mode = R.inputLikeHasSelection(el) ? "selection" : "whole";
  } else if (R.isContentEditable(el)) {
    mode = R.contentEditableHasSelection(el) ? "selection" : "whole";
  } else {
    return { ok: false, reason: "not-editable", adapter: adapter.id };
  }

  const allowWhole = msg.replaceWholeOnEmptySelection !== false;
  if (mode === "whole" && !allowWhole) {
    return { ok: false, reason: "no-selection", adapter: adapter.id };
  }

  let originalText;
  let originalSelStart, originalSelEnd;
  if (mode === "selection") {
    originalText = R.isInputLike(el)
      ? R.getInputLikeSelectionText(el)
      : R.getContentEditableSelectionText(el);
    if (R.isInputLike(el)) {
      originalSelStart = el.selectionStart;
      originalSelEnd = el.selectionEnd;
    }
  } else {
    originalText = R.readText(el);
  }
  if (!originalText || !originalText.trim()) {
    return { ok: false, reason: "empty", adapter: adapter.id, mode };
  }

  let conv;
  try {
    conv = await chrome.runtime.sendMessage({ type: "CONVERT_TEXT", text: originalText });
  } catch (e) {
    return { ok: false, reason: "convert-failed", error: String(e?.message ?? e), adapter: adapter.id };
  }
  if (!conv) return { ok: false, reason: "convert-no-response", adapter: adapter.id };
  if (conv.error) return { ok: false, reason: "convert-error", error: conv.error, adapter: adapter.id };
  if (!conv.swapped) {
    return {
      ok: false,
      reason: "already-correct",
      adapter: adapter.id,
      result: conv.result,
      detected: conv.detected,
    };
  }

  const writeRes = mode === "selection"
    ? adapter.replaceSelection(el, conv.result)
    : adapter.replaceAll(el, conv.result);

  if (writeRes?.ok) {
    rememberChange({
      el,
      original: originalText,
      replacement: conv.result,
      mode,
      adapter: adapter.id,
      isInputLike: R.isInputLike(el),
      origSelStart: originalSelStart,
      origSelEnd: originalSelEnd,
      ts: Date.now(),
    });
    return {
      ok: true,
      adapter: adapter.id,
      mode,
      result: conv.result,
      detected: conv.detected,
      canUndo: true,
    };
  }
  return {
    ok: false,
    reason: writeRes?.reason || "insert-rejected",
    adapter: adapter.id,
    mode,
    result: conv.result,
    detected: conv.detected,
  };
}

function rememberChange(c) {
  __lastChange = { ...c, elRef: c.el ? new WeakRef(c.el) : null };
  delete __lastChange.el;
}

function canUndo() {
  if (!__lastChange) return false;
  const el = __lastChange.elRef?.deref();
  return !!el && el.isConnected !== false;
}

function undoLastChange(R) {
  if (!__lastChange) return { ok: false, reason: "no-change" };
  const el = __lastChange.elRef?.deref();
  if (!el || el.isConnected === false) return { ok: false, reason: "element-gone" };

  const c = __lastChange;
  let success = false;

  if (c.isInputLike) {
    if (c.mode === "whole") {
      success = R.replaceInputLikeAll(el, c.original);
    } else {
      // Selection mode: the replacement is currently sitting at [origSelStart, origSelStart + replacement.length].
      const start = typeof c.origSelStart === "number" ? c.origSelStart : 0;
      const expectedEnd = start + (c.replacement?.length ?? 0);
      try {
        el.focus({ preventScroll: true });
        el.setSelectionRange(start, expectedEnd);
      } catch {}
      success = R.replaceInputLikeSelection(el, c.original);
    }
  } else {
    if (c.mode === "whole") {
      success = R.replaceContentEditableAll(el, c.original);
    } else {
      // For contenteditable selection mode we don't precisely track the offset;
      // best we can do is select-all and rewrite. Tradeoff documented.
      success = R.replaceContentEditableAll(el, c.original);
    }
  }

  if (success) {
    __lastChange = null;
    return { ok: true };
  }
  return { ok: false, reason: "insert-rejected" };
}

function showToast(text, kind, opts = {}) {
  try {
    const id = "vibenest-switcher-toast";
    const old = document.getElementById(id);
    if (old) old.remove();

    const hasResult = typeof opts.result === "string" && opts.result.length > 0;
    const bg = kind === "warn" ? "#b45309" : kind === "err" ? "#b91c1c" : "#ea580c";

    const el = document.createElement("div");
    el.id = id;
    el.style.cssText = [
      "position:fixed",
      "bottom:20px",
      "right:20px",
      "z-index:2147483647",
      "padding:10px 14px",
      "border-radius:8px",
      "font:13px/1.3 -apple-system,Segoe UI,system-ui,sans-serif",
      "color:#fff",
      "box-shadow:0 6px 24px rgba(0,0,0,0.22)",
      `background:${bg}`,
      `max-width:${hasResult ? "360px" : "320px"}`,
      `pointer-events:${hasResult ? "auto" : "none"}`,
      "opacity:0",
      "transform:translateY(8px)",
      "transition:opacity .15s ease, transform .15s ease",
    ].join(";");

    const status = document.createElement("div");
    status.textContent = text;
    el.appendChild(status);

    let hideTimer = null;
    const doHide = () => {
      el.style.opacity = "0";
      el.style.transform = "translateY(8px)";
      setTimeout(() => el.remove(), 200);
    };
    const scheduleHide = (ms) => {
      if (hideTimer) clearTimeout(hideTimer);
      hideTimer = setTimeout(doHide, ms);
    };

    if (hasResult) {
      const body = document.createElement("div");
      body.textContent = opts.result;
      body.style.cssText = [
        "margin-top:6px",
        "padding:6px 8px",
        "max-height:96px",
        "overflow:auto",
        "white-space:pre-wrap",
        "word-break:break-word",
        "user-select:text",
        "font:12px ui-monospace,Menlo,Consolas,monospace",
        "background:rgba(0,0,0,0.18)",
        "border-radius:4px",
      ].join(";");
      el.appendChild(body);

      const btn = document.createElement("button");
      btn.type = "button";
      const labelCopy = opts.copyLabel || "Copy";
      const labelCopied = opts.copiedLabel || "Copied";
      btn.textContent = labelCopy;
      btn.setAttribute("aria-label", labelCopy);
      btn.style.cssText = [
        "margin-top:6px",
        "padding:3px 10px",
        "background:#fff",
        "color:#111827",
        "border:0",
        "border-radius:4px",
        "cursor:pointer",
        "font:12px inherit",
      ].join(";");

      btn.addEventListener("mousedown", (e) => {
        e.preventDefault();
      });
      btn.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const ok = await copyToClipboard(opts.result);
        if (ok) {
          btn.textContent = labelCopied;
          btn.setAttribute("aria-label", labelCopied);
          scheduleHide(2000);
        }
      });
      el.appendChild(btn);

      el.addEventListener("mouseenter", () => {
        if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
      });
      el.addEventListener("mouseleave", () => scheduleHide(2000));
    }

    document.documentElement.appendChild(el);
    requestAnimationFrame(() => {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    });
    scheduleHide(hasResult ? 6000 : 2200);
  } catch { /* ignore — page CSP, etc. */ }
}

async function copyToClipboard(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch { /* fall through to legacy path */ }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;top:-1000px;left:-1000px;opacity:0;pointer-events:none;";
    document.documentElement.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return !!ok;
  } catch {
    return false;
  }
}

function getSelectionText(R) {
  const active = R.findActiveEditable() || document.activeElement;
  if (active && R.isInputLike(active) && R.inputLikeHasSelection(active)) {
    return R.getInputLikeSelectionText(active);
  }
  const sel = window.getSelection();
  return sel ? sel.toString() : "";
}

function legacyReplaceSelection(R, text) {
  const active = R.findActiveEditable() || document.activeElement;
  if (active && R.isInputLike(active)) {
    if (!R.inputLikeHasSelection(active)) return false;
    return R.replaceInputLikeSelection(active, text);
  }
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return false;
  let node = sel.getRangeAt(0).commonAncestorContainer;
  while (node) {
    if (node.nodeType === Node.ELEMENT_NODE && node.isContentEditable) {
      return R.replaceContentEditableSelection(node, text);
    }
    node = node.parentNode;
  }
  return false;
}
