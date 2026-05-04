// Run with: node --test extension/lib/content.test.mjs
//
// Tests for the per-page undo memory in extension/content.js
// (rememberChange/canUndo/undoLastChange). The message handler itself is
// integration-y; this file targets the pure functions.
import test from "node:test";
import assert from "node:assert/strict";
import { loadContentMain } from "./test-helpers.mjs";

function fakeElement({ connected = true } = {}) {
  return { nodeType: 1, tagName: "TEXTAREA", isConnected: connected };
}

// Mock R that records calls and returns a configurable success value.
function makeR(successByMethod = {}) {
  const calls = [];
  function recorder(name, ret = true) {
    return (...args) => {
      calls.push({ name, args });
      return successByMethod[name] ?? ret;
    };
  }
  return {
    calls,
    replaceInputLikeAll: recorder("replaceInputLikeAll"),
    replaceInputLikeSelection: recorder("replaceInputLikeSelection"),
    replaceContentEditableAll: recorder("replaceContentEditableAll"),
    replaceContentEditableSelection: recorder("replaceContentEditableSelection"),
  };
}

test("canUndo: false initially (no rememberChange called)", () => {
  const ctx = loadContentMain();
  assert.equal(ctx.canUndo(), false);
});

test("rememberChange + canUndo: true when element is connected", () => {
  const ctx = loadContentMain();
  const el = fakeElement({ connected: true });
  ctx.rememberChange({
    el, original: "old", replacement: "new", mode: "whole", adapter: "generic", isInputLike: true,
  });
  assert.equal(ctx.canUndo(), true);
});

test("rememberChange + canUndo: false when element disconnected", () => {
  const ctx = loadContentMain();
  const el = fakeElement({ connected: false });
  ctx.rememberChange({ el, original: "x", replacement: "y", mode: "whole", isInputLike: true });
  assert.equal(ctx.canUndo(), false);
});

test("undoLastChange: empty memory returns no-change", () => {
  const ctx = loadContentMain();
  const r = ctx.undoLastChange(makeR());
  assert.equal(r.ok, false);
  assert.equal(r.reason, "no-change");
});

test("undoLastChange: input + whole calls replaceInputLikeAll(el, original)", () => {
  const ctx = loadContentMain();
  const el = fakeElement();
  ctx.rememberChange({
    el, original: "ghbdtn", replacement: "привет", mode: "whole", isInputLike: true,
  });
  const R = makeR();
  const r = ctx.undoLastChange(R);
  assert.equal(r.ok, true);
  assert.equal(R.calls.length, 1);
  assert.equal(R.calls[0].name, "replaceInputLikeAll");
  assert.equal(R.calls[0].args[0], el);
  assert.equal(R.calls[0].args[1], "ghbdtn");
});

test("undoLastChange: input + selection restores selection range first", () => {
  const ctx = loadContentMain();
  const calls = [];
  const el = {
    nodeType: 1, tagName: "INPUT", type: "text", isConnected: true,
    focus: (...a) => calls.push(["focus", a]),
    setSelectionRange: (...a) => calls.push(["setSelectionRange", a]),
  };
  ctx.rememberChange({
    el, original: "ghbdtn", replacement: "привет", mode: "selection",
    isInputLike: true, origSelStart: 5, origSelEnd: 11,
  });
  const R = makeR();
  ctx.undoLastChange(R);
  // We expect focus and setSelectionRange to be called before the R replace.
  const focusIdx = calls.findIndex((c) => c[0] === "focus");
  const setSelIdx = calls.findIndex((c) => c[0] === "setSelectionRange");
  assert.ok(focusIdx >= 0, "focus was called");
  assert.ok(setSelIdx > focusIdx, "setSelectionRange after focus");
  const sr = calls[setSelIdx][1];
  // expectedEnd = origSelStart + replacement.length = 5 + 6 = 11
  assert.deepEqual(sr, [5, 11]);
  assert.equal(R.calls[0].name, "replaceInputLikeSelection");
});

test("undoLastChange: contenteditable falls back to replaceContentEditableAll", () => {
  const ctx = loadContentMain();
  const el = fakeElement();
  ctx.rememberChange({
    el, original: "old", replacement: "new", mode: "whole", isInputLike: false,
  });
  const R = makeR();
  ctx.undoLastChange(R);
  assert.equal(R.calls[0].name, "replaceContentEditableAll");
});

test("undoLastChange: contenteditable selection-mode also uses replaceContentEditableAll (documented compromise)", () => {
  const ctx = loadContentMain();
  const el = fakeElement();
  ctx.rememberChange({
    el, original: "old", replacement: "new", mode: "selection", isInputLike: false,
  });
  const R = makeR();
  ctx.undoLastChange(R);
  // We don't track CE-selection offsets precisely; intentional fallback.
  assert.equal(R.calls[0].name, "replaceContentEditableAll");
});

test("undoLastChange: success clears the memory (subsequent canUndo is false)", () => {
  const ctx = loadContentMain();
  ctx.rememberChange({ el: fakeElement(), original: "x", mode: "whole", isInputLike: true });
  ctx.undoLastChange(makeR());
  assert.equal(ctx.canUndo(), false);
});

test("undoLastChange: insert-rejected when R returns false", () => {
  const ctx = loadContentMain();
  ctx.rememberChange({ el: fakeElement(), original: "x", mode: "whole", isInputLike: true });
  const R = makeR({ replaceInputLikeAll: false });
  const r = ctx.undoLastChange(R);
  assert.equal(r.ok, false);
  assert.equal(r.reason, "insert-rejected");
  // Memory NOT cleared on failure so the user can retry.
  assert.equal(ctx.canUndo(), true);
});

test("undoLastChange: element disconnected after rememberChange → element-gone", () => {
  const ctx = loadContentMain();
  const el = fakeElement({ connected: true });
  ctx.rememberChange({ el, original: "x", mode: "whole", isInputLike: true });
  el.isConnected = false;
  const r = ctx.undoLastChange(makeR());
  assert.equal(r.ok, false);
  assert.equal(r.reason, "element-gone");
});
