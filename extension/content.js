// Thin message shell. Heavy lifting is in content/replace.js + content/adapters.js,
// loaded before this file (see manifest.json content_scripts order).

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
    });
    return;
  }

  if (msg?.type === "REPLACE_SELECTION") {
    const ok = legacyReplaceSelection(R, msg.text);
    sendResponse({ ok });
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

  let text;
  if (mode === "selection") {
    text = R.isInputLike(el)
      ? R.getInputLikeSelectionText(el)
      : R.getContentEditableSelectionText(el);
  } else {
    text = R.readText(el);
  }
  if (!text || !text.trim()) {
    return { ok: false, reason: "empty", adapter: adapter.id, mode };
  }

  let conv;
  try {
    conv = await chrome.runtime.sendMessage({ type: "CONVERT_TEXT", text });
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
    return {
      ok: true,
      adapter: adapter.id,
      mode,
      result: conv.result,
      detected: conv.detected,
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
