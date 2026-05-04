// Run with: node --test extension/lib/autocorrect.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { loadAutocorrect } from "./test-helpers.mjs";

function makeInput({ value = "", selectionStart, selectionEnd, type = "text", autocomplete, readOnly = false, disabled = false } = {}) {
  return {
    nodeType: 1,
    tagName: "INPUT",
    type,
    value,
    selectionStart,
    selectionEnd: selectionEnd ?? selectionStart,
    readOnly,
    disabled,
    getAttribute: (n) => (n === "autocomplete" ? (autocomplete ?? null) : null),
  };
}
function makeTextarea(opts = {}) { return { ...makeInput(opts), tagName: "TEXTAREA" }; }
function makeDiv({ contentEditable = false, autocomplete } = {}) {
  return {
    nodeType: 1,
    tagName: "DIV",
    isContentEditable: contentEditable,
    getAttribute: (n) => (n === "autocomplete" ? (autocomplete ?? null) : null),
  };
}

// ============================================================================
// extractLastWordInput
// ============================================================================

test("extractLastWordInput: basic 'hello world '", () => {
  const { internals } = loadAutocorrect();
  const r = internals.extractLastWordInput({ value: "hello world ", selectionStart: 12 });
  assert.deepEqual({ start: r.start, end: r.end, text: r.text, kind: r.kind }, {
    start: 6, end: 11, text: "world", kind: "input",
  });
});

test("extractLastWordInput: cyrillic 'руддщ '", () => {
  const { internals } = loadAutocorrect();
  const r = internals.extractLastWordInput({ value: "руддщ ", selectionStart: 6 });
  assert.deepEqual({ start: r.start, end: r.end, text: r.text }, {
    start: 0, end: 5, text: "руддщ",
  });
});

test("extractLastWordInput: digits-only before trigger → null", () => {
  const { internals } = loadAutocorrect();
  const r = internals.extractLastWordInput({ value: "123 ", selectionStart: 4 });
  assert.equal(r, null);
});

test("extractLastWordInput: cursor at start → null", () => {
  const { internals } = loadAutocorrect();
  const r = internals.extractLastWordInput({ value: "x", selectionStart: 0 });
  assert.equal(r, null);
});

test("extractLastWordInput: undefined selectionStart falls back to value.length", () => {
  const { internals } = loadAutocorrect();
  const r = internals.extractLastWordInput({ value: "hello ", selectionStart: undefined });
  assert.equal(r.text, "hello");
});

test("extractLastWordInput: word after punctuation 'foo, bar.'", () => {
  const { internals } = loadAutocorrect();
  const r = internals.extractLastWordInput({ value: "foo, bar.", selectionStart: 9 });
  assert.deepEqual({ start: r.start, end: r.end, text: r.text }, {
    start: 5, end: 8, text: "bar",
  });
});

test("extractLastWordInput: empty value → null", () => {
  const { internals } = loadAutocorrect();
  const r = internals.extractLastWordInput({ value: "", selectionStart: 0 });
  assert.equal(r, null);
});

test("extractLastWordInput: only one trigger → null (no preceding word)", () => {
  const { internals } = loadAutocorrect();
  const r = internals.extractLastWordInput({ value: " ", selectionStart: 1 });
  assert.equal(r, null);
});

// ============================================================================
// extractLastWordContentEditable
// ============================================================================

test("extractLastWordContentEditable: basic flow with mocked window.getSelection", () => {
  const text = "hello world ";
  const window = {
    getSelection: () => ({
      rangeCount: 1,
      getRangeAt: () => ({
        collapsed: true,
        startContainer: { nodeType: 3, data: text },
        startOffset: 12,
      }),
    }),
  };
  const { internals } = loadAutocorrect({ extras: { window } });
  const r = internals.extractLastWordContentEditable();
  assert.equal(r.text, "world");
  assert.equal(r.kind, "ce");
});

test("extractLastWordContentEditable: returns null when selection isn't collapsed", () => {
  const window = {
    getSelection: () => ({
      rangeCount: 1,
      getRangeAt: () => ({
        collapsed: false,
        startContainer: { nodeType: 3, data: "hello " },
        startOffset: 6,
      }),
    }),
  };
  const { internals } = loadAutocorrect({ extras: { window } });
  assert.equal(internals.extractLastWordContentEditable(), null);
});

test("extractLastWordContentEditable: returns null when there is no range", () => {
  const window = {
    getSelection: () => ({ rangeCount: 0, getRangeAt: () => { throw new Error("no range"); } }),
  };
  const { internals } = loadAutocorrect({ extras: { window } });
  assert.equal(internals.extractLastWordContentEditable(), null);
});

test("extractLastWordContentEditable: returns null when start container is not a text node", () => {
  const window = {
    getSelection: () => ({
      rangeCount: 1,
      getRangeAt: () => ({
        collapsed: true,
        startContainer: { nodeType: 1 /* ELEMENT */, data: "hello " },
        startOffset: 6,
      }),
    }),
  };
  const { internals } = loadAutocorrect({ extras: { window } });
  assert.equal(internals.extractLastWordContentEditable(), null);
});

// ============================================================================
// isAutoCorrectEligible
// ============================================================================

test("isAutoCorrectEligible: regular text input is OK", () => {
  const { internals } = loadAutocorrect();
  assert.equal(internals.isAutoCorrectEligible(makeInput({ type: "text" })), true);
});

test("isAutoCorrectEligible: textarea is OK", () => {
  const { internals } = loadAutocorrect();
  assert.equal(internals.isAutoCorrectEligible(makeTextarea()), true);
});

test("isAutoCorrectEligible: contenteditable div is OK", () => {
  const { internals } = loadAutocorrect();
  assert.equal(internals.isAutoCorrectEligible(makeDiv({ contentEditable: true })), true);
});

test("isAutoCorrectEligible: password input rejected", () => {
  const { internals } = loadAutocorrect();
  assert.equal(internals.isAutoCorrectEligible(makeInput({ type: "password" })), false);
});

test("isAutoCorrectEligible: hidden input rejected (also not input-like)", () => {
  const { internals } = loadAutocorrect();
  assert.equal(internals.isAutoCorrectEligible(makeInput({ type: "hidden" })), false);
});

test("isAutoCorrectEligible: autocomplete=current-password rejected", () => {
  const { internals } = loadAutocorrect();
  assert.equal(internals.isAutoCorrectEligible(makeInput({ autocomplete: "current-password" })), false);
});

test("isAutoCorrectEligible: autocomplete=new-password rejected", () => {
  const { internals } = loadAutocorrect();
  assert.equal(internals.isAutoCorrectEligible(makeInput({ autocomplete: "new-password" })), false);
});

test("isAutoCorrectEligible: autocomplete=one-time-code rejected", () => {
  const { internals } = loadAutocorrect();
  assert.equal(internals.isAutoCorrectEligible(makeInput({ autocomplete: "one-time-code" })), false);
});

test("isAutoCorrectEligible: autocomplete=cc-number rejected", () => {
  const { internals } = loadAutocorrect();
  assert.equal(internals.isAutoCorrectEligible(makeInput({ autocomplete: "cc-number" })), false);
});

test("isAutoCorrectEligible: readOnly input rejected", () => {
  const { internals } = loadAutocorrect();
  assert.equal(internals.isAutoCorrectEligible(makeInput({ readOnly: true })), false);
});

test("isAutoCorrectEligible: disabled input rejected", () => {
  const { internals } = loadAutocorrect();
  assert.equal(internals.isAutoCorrectEligible(makeInput({ disabled: true })), false);
});

test("isAutoCorrectEligible: contenteditable with credential autocomplete rejected", () => {
  const { internals } = loadAutocorrect();
  const div = makeDiv({ contentEditable: true, autocomplete: "current-password" });
  assert.equal(internals.isAutoCorrectEligible(div), false);
});

test("isAutoCorrectEligible: random non-editable div rejected", () => {
  const { internals } = loadAutocorrect();
  assert.equal(internals.isAutoCorrectEligible(makeDiv({ contentEditable: false })), false);
});

test("isAutoCorrectEligible: null/undefined → false", () => {
  const { internals } = loadAutocorrect();
  assert.equal(internals.isAutoCorrectEligible(null), false);
  assert.equal(internals.isAutoCorrectEligible(undefined), false);
});

test("isAutoCorrectEligible: text node (nodeType=3) → false", () => {
  const { internals } = loadAutocorrect();
  assert.equal(internals.isAutoCorrectEligible({ nodeType: 3, data: "x" }), false);
});
