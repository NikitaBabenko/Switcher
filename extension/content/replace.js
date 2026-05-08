// Shared helpers for reading/writing text in editable elements.
// Exposed as globalThis.__SwitcherReplace; consumed by adapters.js and content.js.
(function () {
  function isInputLike(el) {
    if (!el || el.nodeType !== Node.ELEMENT_NODE) return false;
    const tag = el.tagName;
    if (tag === "TEXTAREA") return true;
    if (tag === "INPUT") {
      const type = (el.type || "").toLowerCase();
      const textTypes = ["text", "search", "url", "tel", "email", "password", "number", ""];
      return textTypes.includes(type);
    }
    return false;
  }

  function isContentEditable(el) {
    if (!el || el.nodeType !== Node.ELEMENT_NODE) return false;
    return el.isContentEditable === true;
  }

  function isEditable(el) {
    return isInputLike(el) || isContentEditable(el);
  }

  function focusElement(el) {
    try { el.focus({ preventScroll: true }); } catch { try { el.focus(); } catch {} }
  }

  function readInputLike(el) {
    return el.value ?? "";
  }

  function readContentEditable(el) {
    return el.innerText ?? el.textContent ?? "";
  }

  function readText(el) {
    return isInputLike(el) ? readInputLike(el) : readContentEditable(el);
  }

  function inputLikeHasSelection(el) {
    return typeof el.selectionStart === "number" &&
           typeof el.selectionEnd === "number" &&
           el.selectionStart !== el.selectionEnd;
  }

  function getInputLikeSelectionText(el) {
    if (!inputLikeHasSelection(el)) return "";
    return el.value.substring(el.selectionStart, el.selectionEnd);
  }

  function selectAllInputLike(el) {
    try { el.setSelectionRange(0, el.value.length); } catch {}
  }

  function selectAllContentEditable(el) {
    const doc = el.ownerDocument || document;
    const win = doc.defaultView || window;
    const sel = win.getSelection ? win.getSelection() : doc.getSelection?.();
    if (!sel) return false;
    const range = doc.createRange();
    range.selectNodeContents(el);
    sel.removeAllRanges();
    sel.addRange(range);
    return true;
  }

  function contentEditableHasSelection(el) {
    const doc = el.ownerDocument || document;
    const win = doc.defaultView || window;
    const sel = win.getSelection ? win.getSelection() : doc.getSelection?.();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return false;
    const range = sel.getRangeAt(0);
    return el.contains(range.commonAncestorContainer);
  }

  function getContentEditableSelectionText(el) {
    const doc = el.ownerDocument || document;
    const win = doc.defaultView || window;
    const sel = win.getSelection ? win.getSelection() : doc.getSelection?.();
    if (!sel || sel.rangeCount === 0) return "";
    const range = sel.getRangeAt(0);
    if (!el.contains(range.commonAncestorContainer)) return "";
    return sel.toString();
  }

  function dispatchInputEvent(el, text, inputType) {
    try {
      el.dispatchEvent(new InputEvent("input", {
        inputType: inputType || "insertText",
        data: text,
        bubbles: true,
        composed: true,
      }));
    } catch {
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }

  function replaceInputLikeSelection(el, text) {
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    if (start === end) return false;
    const value = el.value;
    el.value = value.slice(0, start) + text + value.slice(end);
    try { el.setSelectionRange(start, start + text.length); } catch {}
    dispatchInputEvent(el, text, "insertReplacementText");
    el.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  }

  function replaceInputLikeAll(el, text) {
    el.value = text;
    try { el.setSelectionRange(text.length, text.length); } catch {}
    dispatchInputEvent(el, text, "insertReplacementText");
    el.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  }

  function replaceContentEditableSelection(el, text) {
    focusElement(el);
    const doc = el.ownerDocument || document;
    if (doc.queryCommandSupported && doc.queryCommandSupported("insertText")) {
      try {
        if (doc.execCommand("insertText", false, text)) {
          dispatchInputEvent(el, text, "insertText");
          return true;
        }
      } catch {}
    }
    const win = doc.defaultView || window;
    const sel = win.getSelection ? win.getSelection() : doc.getSelection?.();
    if (!sel || sel.rangeCount === 0) return false;
    const range = sel.getRangeAt(0);
    if (!el.contains(range.commonAncestorContainer)) return false;
    range.deleteContents();
    const node = doc.createTextNode(text);
    range.insertNode(node);
    range.setStartAfter(node);
    range.setEndAfter(node);
    sel.removeAllRanges();
    sel.addRange(range);
    dispatchInputEvent(el, text, "insertText");
    return true;
  }

  function replaceContentEditableAll(el, text) {
    focusElement(el);
    if (!selectAllContentEditable(el)) return false;
    return replaceContentEditableSelection(el, text);
  }

  // Replace helper used by adapters' default replaceAll/replaceSelection.
  // mode: "selection" | "whole"
  function replaceInElement(el, text, mode) {
    if (!el) return { ok: false, reason: "composer-not-found" };
    if (isInputLike(el)) {
      if (mode === "selection") {
        if (!inputLikeHasSelection(el)) return { ok: false, reason: "no-selection" };
        return replaceInputLikeSelection(el, text)
          ? { ok: true }
          : { ok: false, reason: "insert-rejected" };
      }
      return replaceInputLikeAll(el, text)
        ? { ok: true }
        : { ok: false, reason: "insert-rejected" };
    }
    if (isContentEditable(el)) {
      if (mode === "selection") {
        if (!contentEditableHasSelection(el)) return { ok: false, reason: "no-selection" };
        return replaceContentEditableSelection(el, text)
          ? { ok: true }
          : { ok: false, reason: "insert-rejected" };
      }
      return replaceContentEditableAll(el, text)
        ? { ok: true }
        : { ok: false, reason: "insert-rejected" };
    }
    return { ok: false, reason: "not-editable" };
  }

  // Remember the most recently focused editable so we can recover when something
  // outside the page (the side panel, a popup) blurs the page and document.
  // activeElement falls back to <body>. WeakRef so we don't pin DOM after nav.
  let lastFocusedEditableRef = null;
  document.addEventListener("focusin", (e) => {
    const t = e.target;
    if (t && t.nodeType === Node.ELEMENT_NODE && isEditable(t)) {
      try { lastFocusedEditableRef = new WeakRef(t); } catch { lastFocusedEditableRef = null; }
    }
  }, true);

  // Walk into shadow roots and same-origin iframes to find the actually-focused
  // editable element (document.activeElement only sees the host element from outside).
  function findActiveEditable() {
    function descend(doc) {
      let active = doc.activeElement;
      while (active) {
        if (active.tagName === "IFRAME") {
          try {
            const innerDoc = active.contentDocument;
            if (innerDoc) {
              const inner = descend(innerDoc);
              if (inner) return inner;
            }
          } catch { /* cross-origin */ }
        }
        if (active.shadowRoot) {
          const inner = descend(active.shadowRoot);
          if (inner) return inner;
        }
        if (isEditable(active)) return active;
        break;
      }
      return null;
    }
    const live = descend(document);
    if (live) return live;
    const cached = lastFocusedEditableRef?.deref();
    if (cached && cached.isConnected && isEditable(cached)) return cached;
    return null;
  }

  function queryDeepFirst(selectors, root) {
    root = root || document;
    const stack = [root];
    while (stack.length) {
      const node = stack.pop();
      for (const sel of selectors) {
        try {
          const found = node.querySelector ? node.querySelector(sel) : null;
          if (found) return found;
        } catch {}
      }
      if (node.querySelectorAll) {
        let all;
        try { all = node.querySelectorAll("*"); } catch { all = []; }
        for (const el of all) {
          if (el.shadowRoot) stack.push(el.shadowRoot);
          if (el.tagName === "IFRAME") {
            try {
              const innerDoc = el.contentDocument;
              if (innerDoc) stack.push(innerDoc);
            } catch {}
          }
        }
      }
    }
    return null;
  }

  globalThis.__SwitcherReplace = {
    isInputLike,
    isContentEditable,
    isEditable,
    focusElement,
    readInputLike,
    readContentEditable,
    readText,
    inputLikeHasSelection,
    contentEditableHasSelection,
    getInputLikeSelectionText,
    getContentEditableSelectionText,
    selectAllInputLike,
    selectAllContentEditable,
    replaceInputLikeSelection,
    replaceInputLikeAll,
    replaceContentEditableSelection,
    replaceContentEditableAll,
    replaceInElement,
    findActiveEditable,
    queryDeepFirst,
    dispatchInputEvent,
  };
})();
