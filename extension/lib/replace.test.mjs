// Run with: node --test extension/lib/replace.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { loadReplace } from "./test-helpers.mjs";

const R = loadReplace();

class FakeDataTransfer {
  constructor() { this._data = {}; }
  setData(type, data) { this._data[type] = data; }
  getData(type) { return this._data[type] ?? ""; }
}
class FakeClipboardEvent {
  constructor(type, init = {}) {
    this.type = type;
    this.clipboardData = init.clipboardData ?? null;
    this.bubbles = !!init.bubbles;
    this.cancelable = !!init.cancelable;
    this.defaultPrevented = false;
  }
  preventDefault() { this.defaultPrevented = true; }
}
function loadReplaceWithClipboard(opts = {}) {
  // makeContext puts `extras` into the vm context globals; the top-level
  // `document` override is destructured separately. Forward both correctly.
  const { extras: callerExtras, ...rest } = opts;
  return loadReplace({
    ...rest,
    extras: { ClipboardEvent: FakeClipboardEvent, DataTransfer: FakeDataTransfer, ...(callerExtras || {}) },
  });
}
function frameworkEl(marker, extras = {}) {
  const el = { nodeType: 1, tagName: "DIV", isContentEditable: true, ...extras };
  el.closest = (sel) => {
    const parts = sel.split(",").map((s) => s.trim());
    return parts.some((p) => marker.includes(p)) ? el : null;
  };
  return el;
}

function input(type, props = {}) {
  return { nodeType: 1, tagName: "INPUT", type, ...props };
}
function textarea(props = {}) {
  return { nodeType: 1, tagName: "TEXTAREA", ...props };
}
function div(props = {}) {
  return { nodeType: 1, tagName: "DIV", ...props };
}

// ============================================================================
// isInputLike
// ============================================================================

test("isInputLike: textarea is input-like", () => {
  assert.equal(R.isInputLike(textarea()), true);
});

test("isInputLike: input/text", () => {
  assert.equal(R.isInputLike(input("text")), true);
});

test("isInputLike: input/email", () => {
  assert.equal(R.isInputLike(input("email")), true);
});

test("isInputLike: input/search", () => {
  assert.equal(R.isInputLike(input("search")), true);
});

test("isInputLike: input/url", () => {
  assert.equal(R.isInputLike(input("url")), true);
});

test("isInputLike: input/tel", () => {
  assert.equal(R.isInputLike(input("tel")), true);
});

test("isInputLike: input/number", () => {
  assert.equal(R.isInputLike(input("number")), true);
});

test("isInputLike: input/password is input-like (eligibility filter rejects later)", () => {
  assert.equal(R.isInputLike(input("password")), true);
});

test("isInputLike: input without type is input-like", () => {
  assert.equal(R.isInputLike({ nodeType: 1, tagName: "INPUT", type: "" }), true);
});

test("isInputLike: input/checkbox is NOT input-like", () => {
  assert.equal(R.isInputLike(input("checkbox")), false);
});

test("isInputLike: input/file is NOT input-like", () => {
  assert.equal(R.isInputLike(input("file")), false);
});

test("isInputLike: button is NOT input-like", () => {
  assert.equal(R.isInputLike({ nodeType: 1, tagName: "BUTTON" }), false);
});

test("isInputLike: div is NOT input-like", () => {
  assert.equal(R.isInputLike(div()), false);
});

test("isInputLike: null/undefined", () => {
  assert.equal(R.isInputLike(null), false);
  assert.equal(R.isInputLike(undefined), false);
});

test("isInputLike: text node (nodeType !== 1)", () => {
  assert.equal(R.isInputLike({ nodeType: 3 }), false);
});

// ============================================================================
// isContentEditable
// ============================================================================

test("isContentEditable: div with isContentEditable=true", () => {
  assert.equal(R.isContentEditable(div({ isContentEditable: true })), true);
});

test("isContentEditable: div without flag → false", () => {
  assert.equal(R.isContentEditable(div({ isContentEditable: false })), false);
  assert.equal(R.isContentEditable(div()), false);
});

test("isContentEditable: text node → false", () => {
  assert.equal(R.isContentEditable({ nodeType: 3, isContentEditable: true }), false);
});

test("isContentEditable: null", () => {
  assert.equal(R.isContentEditable(null), false);
});

// ============================================================================
// isEditable (union)
// ============================================================================

test("isEditable: input, textarea, contenteditable all true", () => {
  assert.equal(R.isEditable(input("text")), true);
  assert.equal(R.isEditable(textarea()), true);
  assert.equal(R.isEditable(div({ isContentEditable: true })), true);
});

test("isEditable: button, plain div → false", () => {
  assert.equal(R.isEditable({ nodeType: 1, tagName: "BUTTON" }), false);
  assert.equal(R.isEditable(div()), false);
});

// ============================================================================
// inputLikeHasSelection
// ============================================================================

test("inputLikeHasSelection: equal start/end → false", () => {
  assert.equal(R.inputLikeHasSelection({ selectionStart: 5, selectionEnd: 5 }), false);
});

test("inputLikeHasSelection: distinct start/end → true", () => {
  assert.equal(R.inputLikeHasSelection({ selectionStart: 0, selectionEnd: 5 }), true);
});

test("inputLikeHasSelection: undefined ends → false", () => {
  assert.equal(R.inputLikeHasSelection({ selectionStart: 0 }), false);
  assert.equal(R.inputLikeHasSelection({}), false);
});

test("inputLikeHasSelection: non-numeric → false", () => {
  assert.equal(R.inputLikeHasSelection({ selectionStart: "a", selectionEnd: "b" }), false);
});

// ============================================================================
// getInputLikeSelectionText
// ============================================================================

test("getInputLikeSelectionText: substring [start, end)", () => {
  const el = { value: "hello world", selectionStart: 6, selectionEnd: 11 };
  assert.equal(R.getInputLikeSelectionText(el), "world");
});

test("getInputLikeSelectionText: empty when no selection", () => {
  const el = { value: "hello", selectionStart: 0, selectionEnd: 0 };
  assert.equal(R.getInputLikeSelectionText(el), "");
});

// ============================================================================
// readText
// ============================================================================

test("readText: returns value for input-like", () => {
  assert.equal(R.readText({ nodeType: 1, tagName: "TEXTAREA", value: "abc" }), "abc");
  assert.equal(R.readText({ nodeType: 1, tagName: "INPUT", type: "text", value: "xyz" }), "xyz");
});

test("readText: returns innerText for non-input-like (contenteditable)", () => {
  assert.equal(R.readText({ nodeType: 1, tagName: "DIV", innerText: "rendered" }), "rendered");
});

test("readText: falls back to textContent if innerText absent", () => {
  assert.equal(R.readText({ nodeType: 1, tagName: "DIV", textContent: "fallback" }), "fallback");
});

// ============================================================================
// dispatchInputEvent shape
// ============================================================================

test("dispatchInputEvent: dispatches an InputEvent with the right shape", () => {
  const fired = [];
  const el = { dispatchEvent: (e) => { fired.push(e); return true; } };
  R.dispatchInputEvent(el, "hello", "insertReplacementText");
  assert.equal(fired.length, 1);
  assert.equal(fired[0].type, "input");
  assert.equal(fired[0].inputType, "insertReplacementText");
  assert.equal(fired[0].data, "hello");
  assert.equal(fired[0].bubbles, true);
  assert.equal(fired[0].composed, true);
});

test("dispatchInputEvent: defaults inputType to 'insertText'", () => {
  const fired = [];
  const el = { dispatchEvent: (e) => fired.push(e) };
  R.dispatchInputEvent(el, "x");
  assert.equal(fired[0].inputType, "insertText");
});

// ============================================================================
// replaceInputLikeAll / replaceInputLikeSelection (smoke)
// ============================================================================

test("replaceInputLikeAll: writes value, sets caret to end, fires events", () => {
  const fired = [];
  let cursorRange = null;
  const el = {
    nodeType: 1, tagName: "TEXTAREA",
    value: "old text",
    setSelectionRange(s, e) { cursorRange = [s, e]; },
    dispatchEvent: (ev) => fired.push(ev.type),
  };
  const ok = R.replaceInputLikeAll(el, "new text");
  assert.equal(ok, true);
  assert.equal(el.value, "new text");
  assert.deepEqual(cursorRange, ["new text".length, "new text".length]);
  assert.ok(fired.includes("input"));
  assert.ok(fired.includes("change"));
});

test("replaceInputLikeSelection: swaps the selected substring", () => {
  const el = {
    nodeType: 1, tagName: "TEXTAREA",
    value: "hello world",
    selectionStart: 6,
    selectionEnd: 11,
    setSelectionRange() {},
    dispatchEvent() {},
  };
  const ok = R.replaceInputLikeSelection(el, "JS");
  assert.equal(ok, true);
  assert.equal(el.value, "hello JS");
});

test("replaceInputLikeSelection: empty selection returns false", () => {
  const el = {
    nodeType: 1, tagName: "INPUT", type: "text",
    value: "hello",
    selectionStart: 3, selectionEnd: 3,
    setSelectionRange() {}, dispatchEvent() {},
  };
  assert.equal(R.replaceInputLikeSelection(el, "x"), false);
});

// ============================================================================
// replaceInElement dispatch
// ============================================================================

test("replaceInElement: not editable → not-editable reason", () => {
  const r = R.replaceInElement({ nodeType: 1, tagName: "DIV" }, "x", "selection");
  assert.equal(r.ok, false);
  assert.equal(r.reason, "not-editable");
});

test("replaceInElement: null → composer-not-found", () => {
  const r = R.replaceInElement(null, "x", "whole");
  assert.equal(r.ok, false);
  assert.equal(r.reason, "composer-not-found");
});

test("replaceInElement: input-like + selection mode + no selection → no-selection", () => {
  const el = {
    nodeType: 1, tagName: "TEXTAREA",
    value: "abc", selectionStart: 0, selectionEnd: 0,
  };
  const r = R.replaceInElement(el, "x", "selection");
  assert.equal(r.ok, false);
  assert.equal(r.reason, "no-selection");
});

test("replaceInElement: input-like + whole mode → ok", () => {
  const el = {
    nodeType: 1, tagName: "TEXTAREA", value: "old",
    setSelectionRange() {}, dispatchEvent() {},
  };
  const r = R.replaceInElement(el, "new", "whole");
  assert.equal(r.ok, true);
  assert.equal(el.value, "new");
});

// ============================================================================
// detectFramework
// ============================================================================

test("detectFramework: lexical via [data-lexical-editor]", () => {
  const el = frameworkEl(['[data-lexical-editor="true"]', '[data-lexical-editor]']);
  assert.equal(R.detectFramework(el), "lexical");
});

test("detectFramework: slate via [data-slate-editor]", () => {
  const el = frameworkEl(['[data-slate-editor="true"]']);
  assert.equal(R.detectFramework(el), "slate");
});

test("detectFramework: draftjs via .public-DraftEditor-content (Twitter, Reddit)", () => {
  const el = frameworkEl(['.public-DraftEditor-content']);
  assert.equal(R.detectFramework(el), "draftjs");
});

test("detectFramework: draftjs via .DraftEditor-root", () => {
  const el = frameworkEl(['.DraftEditor-root']);
  assert.equal(R.detectFramework(el), "draftjs");
});

test("detectFramework: draftjs via .public-DraftStyleDefault-block", () => {
  const el = frameworkEl(['.public-DraftStyleDefault-block']);
  assert.equal(R.detectFramework(el), "draftjs");
});

test("detectFramework: prosemirror via .ProseMirror", () => {
  const el = frameworkEl(['.ProseMirror']);
  assert.equal(R.detectFramework(el), "prosemirror");
});

test("detectFramework: quill via .ql-editor", () => {
  const el = frameworkEl(['.ql-editor']);
  assert.equal(R.detectFramework(el), "quill");
});

test("detectFramework: returns null for plain contenteditable", () => {
  const el = frameworkEl([]);
  assert.equal(R.detectFramework(el), null);
});

test("detectFramework: null/undefined/non-element → null", () => {
  assert.equal(R.detectFramework(null), null);
  assert.equal(R.detectFramework(undefined), null);
  assert.equal(R.detectFramework({ nodeType: 3 }), null);
});

test("detectFramework: element without closest method → null (graceful)", () => {
  assert.equal(R.detectFramework({ nodeType: 1, tagName: "DIV" }), null);
});

// ============================================================================
// replaceViaSyntheticPaste
// ============================================================================

test("replaceViaSyntheticPaste: dispatches paste with text/plain payload", () => {
  const Rc = loadReplaceWithClipboard();
  let captured = null;
  const el = {
    nodeType: 1, tagName: "DIV", isContentEditable: true,
    dispatchEvent(ev) { captured = ev; ev.preventDefault(); return false; },
  };
  const ok = Rc.replaceViaSyntheticPaste(el, "привет");
  assert.equal(ok, true);
  assert.equal(captured.type, "paste");
  assert.equal(captured.bubbles, true);
  assert.equal(captured.cancelable, true);
  assert.equal(captured.clipboardData.getData("text/plain"), "привет");
});

test("replaceViaSyntheticPaste: returns false when no handler cancels (no editor took it)", () => {
  const Rc = loadReplaceWithClipboard();
  const el = {
    nodeType: 1, tagName: "DIV", isContentEditable: true,
    dispatchEvent() { return true; },
  };
  assert.equal(Rc.replaceViaSyntheticPaste(el, "x"), false);
});

test("replaceViaSyntheticPaste: returns false when ClipboardEvent ctor unavailable", () => {
  // Default loadReplace context has no ClipboardEvent — try/catch must swallow.
  const el = { nodeType: 1, tagName: "DIV", dispatchEvent() { return false; } };
  assert.equal(R.replaceViaSyntheticPaste(el, "x"), false);
});

// ============================================================================
// replaceContentEditableSelection: framework branch uses paste-first
// ============================================================================

test("replaceContentEditableSelection: framework editor → synthetic paste, no execCommand", () => {
  let execCalled = false;
  const Rc = loadReplaceWithClipboard({
    document: {
      addEventListener() {},
      activeElement: null,
      queryCommandSupported: () => { execCalled = true; return true; },
      execCommand: () => { execCalled = true; return true; },
      ownerDocument: null,
      defaultView: null,
    },
  });
  let pasteEv = null;
  const el = frameworkEl(['.public-DraftEditor-content'], {
    focus() {},
    dispatchEvent(ev) {
      if (ev.type === "paste") { pasteEv = ev; ev.preventDefault(); return false; }
      return true;
    },
  });
  const ok = Rc.replaceContentEditableSelection(el, "новый");
  assert.equal(ok, true);
  assert.equal(execCalled, false);
  assert.equal(pasteEv?.clipboardData.getData("text/plain"), "новый");
});

test("replaceContentEditableSelection: plain contenteditable still uses execCommand path", () => {
  let execArg = null;
  const Rc = loadReplace({
    document: {
      addEventListener() {},
      activeElement: null,
      queryCommandSupported: () => true,
      execCommand: (_cmd, _ui, value) => { execArg = value; return true; },
      ownerDocument: null,
      defaultView: null,
    },
  });
  let pasteSeen = false;
  const el = frameworkEl([], {
    focus() {},
    dispatchEvent(ev) { if (ev.type === "paste") pasteSeen = true; return true; },
  });
  const ok = Rc.replaceContentEditableSelection(el, "plain");
  assert.equal(ok, true);
  assert.equal(execArg, "plain");
  assert.equal(pasteSeen, false);
});

test("replaceContentEditableAll: framework whole-mode fires selectionchange on document before paste on element", () => {
  const dispatchLog = [];
  const fakeRange = {};
  const fakeSelection = {
    rangeCount: 0,
    removeAllRanges() {},
    addRange() { this.rangeCount = 1; },
  };
  const fakeDoc = {
    addEventListener() {},
    activeElement: null,
    queryCommandSupported: () => false,
    execCommand: () => false,
    createRange: () => ({ selectNodeContents() {} }),
    createTextNode: (data) => ({ nodeType: 3, data }),
    ownerDocument: null,
    defaultView: null,
    dispatchEvent(ev) { dispatchLog.push(["doc", ev.type]); return true; },
  };
  const Rc = loadReplaceWithClipboard({
    document: fakeDoc,
    extras: { window: { getSelection: () => fakeSelection } },
  });
  const el = frameworkEl(['.public-DraftEditor-content'], {
    focus() {},
    dispatchEvent(ev) {
      dispatchLog.push(["el", ev.type]);
      if (ev.type === "paste") { ev.preventDefault(); return false; }
      return true;
    },
    ownerDocument: fakeDoc,
  });
  const ok = Rc.replaceContentEditableAll(el, "новый");
  assert.equal(ok, true);
  const docSelChange = dispatchLog.findIndex(([t, k]) => t === "doc" && k === "selectionchange");
  const elPaste = dispatchLog.findIndex(([t, k]) => t === "el" && k === "paste");
  assert.ok(docSelChange >= 0, "selectionchange should fire on the document");
  assert.ok(elPaste >= 0, "paste should fire on the element");
  assert.ok(docSelChange < elPaste, "selectionchange must precede paste");
});
