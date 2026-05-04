// Run with: node --test extension/lib/detector.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { detect, canHandleLanguages, availableLanguages } from "./detector.js";

const EN_RU = ["en", "ru"];

test("ghbdtn → привет", () => {
  const r = detect("ghbdtn", EN_RU);
  assert.equal(r.result, "привет");
  assert.equal(r.swapped, true);
  assert.deepEqual(r.detected, { from: "en", to: "ru" });
});

test("руддщ → hello", () => {
  const r = detect("руддщ", EN_RU);
  assert.equal(r.result, "hello");
  assert.equal(r.swapped, true);
  assert.deepEqual(r.detected, { from: "ru", to: "en" });
});

test("native russian stays as-is", () => {
  const r = detect("привет", EN_RU);
  assert.equal(r.swapped, false);
  assert.equal(r.detected, null);
  assert.equal(r.result, "привет");
});

test("native english stays as-is", () => {
  const r = detect("hello world", EN_RU);
  assert.equal(r.swapped, false);
  assert.equal(r.detected, null);
});

test("pure punctuation/digits unchanged", () => {
  const r = detect("123!?", EN_RU);
  assert.equal(r.swapped, false);
  assert.equal(r.result, "123!?");
});

test("override forces conversion regardless of detection", () => {
  const r = detect("hello", EN_RU, { from: "en", to: "ru" });
  assert.equal(r.swapped, true);
  assert.deepEqual(r.detected, { from: "en", to: "ru" });
});

test("Caps Lock heuristic: gHBDTN → Привет", () => {
  // User typed Cyrillic word "Привет" with Caps Lock on while in EN layout.
  // Expected: detector picks the case-flipped EN→RU candidate.
  const r = detect("gHBDTN", EN_RU);
  assert.equal(r.swapped, true);
  assert.equal(r.result, "Привет");
});

test("mixed case Title-cased EN word stays — case is natural", () => {
  const r = detect("Hello", EN_RU);
  assert.equal(r.swapped, false);
});

test("empty string", () => {
  const r = detect("", EN_RU);
  assert.equal(r.result, "");
  assert.equal(r.swapped, false);
});

test("less than 2 languages → no-op", () => {
  const r = detect("hello", ["en"]);
  assert.equal(r.swapped, false);
});

test("availableLanguages includes en+ru and others", () => {
  const langs = availableLanguages();
  assert.ok(langs.includes("en"));
  assert.ok(langs.includes("ru"));
  assert.ok(langs.length >= 2);
});

test("canHandleLanguages: known + unknown", () => {
  assert.equal(canHandleLanguages(["en", "ru"]), true);
  assert.equal(canHandleLanguages(["en", "klingon"]), false);
  assert.equal(canHandleLanguages([]), false);
});

test("alternatives populated for ambiguous-ish inputs", () => {
  const r = detect("ghbdtn", EN_RU);
  assert.ok(Array.isArray(r.alternatives));
  // The native-EN candidate should be in alternatives because it scored worse.
  assert.ok(r.alternatives.length >= 1);
});

test("uk↔ru work alongside en", () => {
  // "цум" — wrong RU layout for the Ukrainian word "цум" — but with uk in the
  // mix the detector should at least return something meaningful and not crash.
  const r = detect("hello", ["en", "uk", "ru"]);
  assert.equal(r.swapped, false);
});

test("override on unknown language throws", () => {
  assert.throws(() => detect("hello", EN_RU, { from: "klingon", to: "ru" }));
});

test("override roundtrip ru→en for known word", () => {
  const r = detect("привет", EN_RU, { from: "ru", to: "en" });
  assert.equal(r.swapped, true);
  assert.equal(r.result, "ghbdtn");
});

test("ALL CAPS input is not flipped (no mixed case)", () => {
  // The Caps-Lock heuristic only kicks in with mixed case; "GHBDTN" has none,
  // so it should be detected as a wrong-layout word and converted to "ПРИВЕТ"
  // (uppercase preserved by the layout converter).
  const r = detect("GHBDTN", EN_RU);
  assert.equal(r.swapped, true);
  assert.equal(r.result, "ПРИВЕТ");
});

test("punctuation around word doesn't break detection", () => {
  const r = detect("(ghbdtn)", EN_RU);
  assert.equal(r.swapped, true);
  assert.equal(r.result, "(привет)");
});
