// Optional Punto-Switcher-style auto-correction. Disabled by default; turned on
// from Options. Lives entirely in the content script — never sends keystrokes
// anywhere; conversion goes through the same chrome.runtime CONVERT_TEXT pipe
// (which uses the bundled offline detector).
(function () {
  const R = globalThis.__SwitcherReplace;
  if (!R) return;

  const TRIGGER_DATA = /[\s.,!?;:)\]}]/;
  const MIN_WORD_LEN = 3;
  const COOLDOWN_MS = 30_000;
  const SKIP_AUTOCOMPLETE = /(current-password|new-password|one-time-code|cc-|otp)/i;

  const settings = {
    autoCorrect: false,
    siteMode: "all",
    siteList: [],
  };

  let _replacing = false;
  // WeakMap<Element, { word: string, ts: number }>: skip the same word in the
  // same field for COOLDOWN_MS so we don't ping-pong with the user.
  const recent = new WeakMap();

  async function loadSettings() {
    try {
      const store = chrome.storage?.sync || chrome.storage?.local;
      if (!store) return;
      const s = await store.get(["autoCorrect", "siteMode", "siteList"]);
      settings.autoCorrect = s.autoCorrect === true;
      settings.siteMode = s.siteMode || "all";
      settings.siteList = Array.isArray(s.siteList) ? s.siteList : [];
    } catch { /* ignore */ }
  }

  loadSettings();
  chrome.storage?.onChanged?.addListener((changes, area) => {
    if (area !== "sync" && area !== "local") return;
    if ("autoCorrect" in changes || "siteMode" in changes || "siteList" in changes) {
      loadSettings();
    }
  });

  function hostAllowed() {
    const host = (location.hostname || "").toLowerCase();
    const list = (settings.siteList || []).map((s) => s.toLowerCase()).filter(Boolean);
    const matches = list.some((h) => host === h || host.endsWith("." + h));
    if (settings.siteMode === "blacklist") return !matches;
    if (settings.siteMode === "whitelist") return matches;
    return true;
  }

  function isAutoCorrectEligible(el) {
    if (!el || el.nodeType !== Node.ELEMENT_NODE) return false;
    if (R.isInputLike(el)) {
      const type = (el.type || "").toLowerCase();
      if (type === "password" || type === "hidden") return false;
      const ac = (el.getAttribute("autocomplete") || "").toLowerCase();
      if (ac && SKIP_AUTOCOMPLETE.test(ac)) return false;
      if (el.readOnly || el.disabled) return false;
      return true;
    }
    if (R.isContentEditable(el)) {
      const ac = (el.getAttribute("autocomplete") || "").toLowerCase();
      if (ac && SKIP_AUTOCOMPLETE.test(ac)) return false;
      return true;
    }
    return false;
  }

  function extractLastWordInput(el) {
    const v = el.value || "";
    const cursor = el.selectionStart ?? v.length;
    const end = cursor - 1; // index of the just-typed trigger char
    if (end <= 0) return null;
    let start = end;
    while (start > 0 && /\p{L}/u.test(v[start - 1])) start--;
    if (start === end) return null;
    return { kind: "input", el, start, end, text: v.substring(start, end) };
  }

  function extractLastWordContentEditable() {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    const range = sel.getRangeAt(0);
    if (!range.collapsed) return null;
    const node = range.startContainer;
    if (!node || node.nodeType !== Node.TEXT_NODE) return null;
    const text = node.data || "";
    const cursor = range.startOffset;
    const end = cursor - 1;
    if (end <= 0) return null;
    let start = end;
    while (start > 0 && /\p{L}/u.test(text[start - 1])) start--;
    if (start === end) return null;
    return { kind: "ce", node, start, end, text: text.substring(start, end) };
  }

  function replaceWordInput(info, replacement, triggerChar) {
    const el = info.el;
    const v = el.value;
    const tail = v.slice(info.end); // includes trigger char + everything after
    el.value = v.slice(0, info.start) + replacement + tail;
    const newCursor = info.start + replacement.length + 1; // +1 = past the trigger char
    try { el.setSelectionRange(newCursor, newCursor); } catch {}
    try {
      el.dispatchEvent(new InputEvent("input", {
        inputType: "insertReplacementText",
        data: replacement,
        bubbles: true,
        composed: true,
      }));
    } catch {
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
    return true;
  }

  function replaceWordContentEditable(info, replacement, triggerChar) {
    // Select [word + trigger char] and let the host framework apply the swap.
    // Prefer a synthetic paste for framework editors (DraftJS/Slate/Quill/
    // ProseMirror/Lexical) because their onPaste pipelines update internal
    // state — execCommand and raw text-node mutation get reverted by them.
    const doc = info.node.ownerDocument || document;
    const win = doc.defaultView || window;
    const sel = win.getSelection();
    if (!sel) return false;
    const range = doc.createRange();
    try {
      range.setStart(info.node, info.start);
      // info.end is the trigger-char index; include it so we keep the spacing.
      range.setEnd(info.node, info.end + 1);
    } catch { return false; }
    sel.removeAllRanges();
    sel.addRange(range);

    let host = info.node.parentElement;
    while (host && !host.isContentEditable) host = host.parentElement;
    if (host && R.detectFramework(host)) {
      // Force the editor's selection model to sync with our programmatic Range
      // before the paste — without this, framework editors (DraftJS/Slate/Quill/
      // ProseMirror/Lexical) treat the paste as an insert at their cached cursor
      // and append the correction instead of replacing the original word.
      try { doc.dispatchEvent(new Event("selectionchange")); } catch {}
      if (R.replaceViaSyntheticPaste(host, replacement + triggerChar)) {
        return true;
      }
    }

    if (doc.queryCommandSupported && doc.queryCommandSupported("insertText")) {
      try {
        if (doc.execCommand("insertText", false, replacement + triggerChar)) {
          return true;
        }
      } catch {}
    }
    // Manual fallback: edit the text node directly.
    try {
      info.node.data = info.node.data.slice(0, info.start) + replacement + info.node.data.slice(info.end);
      const newCursor = info.start + replacement.length + 1;
      const r2 = doc.createRange();
      r2.setStart(info.node, Math.min(newCursor, info.node.data.length));
      r2.collapse(true);
      sel.removeAllRanges();
      sel.addRange(r2);
      if (host) {
        host.dispatchEvent(new InputEvent("input", {
          inputType: "insertReplacementText",
          data: replacement,
          bubbles: true,
          composed: true,
        }));
      }
      return true;
    } catch {
      return false;
    }
  }

  document.addEventListener("input", onInput, true);

  async function onInput(e) {
    if (!settings.autoCorrect) return;
    if (_replacing) return;
    if (e.isComposing) return;
    if (e.inputType !== "insertText") return;
    const data = e.data;
    if (!data || !TRIGGER_DATA.test(data)) return;

    const target = e.target;
    if (!isAutoCorrectEligible(target)) return;
    if (!hostAllowed()) return;

    const info = R.isInputLike(target)
      ? extractLastWordInput(target)
      : extractLastWordContentEditable();
    if (!info) return;
    if (info.text.length < MIN_WORD_LEN) return;

    const memo = recent.get(target);
    if (memo && memo.word === info.text && Date.now() - memo.ts < COOLDOWN_MS) return;

    let conv;
    try {
      conv = await chrome.runtime.sendMessage({ type: "CONVERT_TEXT", text: info.text });
    } catch { return; }
    if (!conv || conv.error || !conv.swapped) return;

    _replacing = true;
    let ok = false;
    try {
      ok = info.kind === "input"
        ? replaceWordInput(info, conv.result, data)
        : replaceWordContentEditable(info, conv.result, data);
    } finally {
      // Reset on next tick so we ignore the input event our replacement fires.
      setTimeout(() => { _replacing = false; }, 0);
    }
    if (ok) {
      recent.set(target, { word: conv.result, ts: Date.now() });
    }
  }

  // Exposed for tests only. Production code never reads this.
  globalThis.__SwitcherAutocorrectInternals = {
    extractLastWordInput,
    extractLastWordContentEditable,
    isAutoCorrectEligible,
  };
})();
