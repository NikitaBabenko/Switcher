chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === "GET_SELECTION") {
    sendResponse({ text: getSelectionText() });
    return;
  }
  if (msg?.type === "REPLACE_SELECTION") {
    const ok = replaceSelection(msg.text);
    sendResponse({ ok });
    return;
  }
});

function getSelectionText() {
  const active = document.activeElement;
  if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA")) {
    const el = active;
    if (typeof el.selectionStart === "number" && typeof el.selectionEnd === "number" && el.selectionStart !== el.selectionEnd) {
      return el.value.substring(el.selectionStart, el.selectionEnd);
    }
  }
  const sel = window.getSelection();
  return sel ? sel.toString() : "";
}

function replaceSelection(text) {
  const active = document.activeElement;
  if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA")) {
    const el = active;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    if (start === end) return false;

    const before = el.value.slice(0, start);
    const after = el.value.slice(end);
    el.value = before + text + after;
    el.setSelectionRange(start, start + text.length);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  }

  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return false;

  // Try execCommand first — preserves undo on contenteditable.
  if (document.queryCommandSupported && document.queryCommandSupported("insertText")) {
    if (document.execCommand("insertText", false, text)) return true;
  }

  const range = sel.getRangeAt(0);
  const editable = isInsideEditable(range.commonAncestorContainer);
  if (!editable) return false;

  range.deleteContents();
  range.insertNode(document.createTextNode(text));
  return true;
}

function isInsideEditable(node) {
  let n = node;
  while (n) {
    if (n.nodeType === Node.ELEMENT_NODE && n.isContentEditable) return true;
    n = n.parentNode;
  }
  return false;
}
