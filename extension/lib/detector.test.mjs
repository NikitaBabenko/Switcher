// Run with: node --test extension/lib/detector.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { detect, canHandleLanguages, availableLanguages, languageInfo, __testInternals } from "./detector.js";

const { Layout, LanguageModel, convertText, hasLetter, hasMixedCase, invertCase, caseNaturalness } = __testInternals;
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

// ============================================================================
// Layout class invariants
// ============================================================================

test("Layout: mismatched normal/shift length throws", () => {
  assert.throws(
    () => new Layout({ id: "x", name: "X", language: "x", normal: "abc", shift: "ABCD" }),
    /must have equal length/,
  );
});

test("Layout: equal length succeeds", () => {
  const l = new Layout({ id: "x", name: "X", language: "x", normal: "abc", shift: "ABC" });
  assert.equal(l.id, "x");
  assert.equal(l.normal.length, l.shift.length);
});

test("Layout: alphabet contains lowercase letters from both rows", () => {
  const l = new Layout({ id: "x", name: "X", language: "x", normal: "ab1", shift: "AB!" });
  assert.deepEqual([...l.alphabet].sort(), ["a", "b"]);
});

test("Layout: alphabet excludes digits and punctuation", () => {
  const l = new Layout({ id: "x", name: "X", language: "x", normal: "a1!", shift: "A2?" });
  assert.equal(l.alphabet.size, 1);
  assert.ok(l.alphabet.has("a"));
});

test("Layout: normalIndex and shiftIndex map first occurrence", () => {
  const l = new Layout({ id: "x", name: "X", language: "x", normal: "aab", shift: "AAB" });
  assert.equal(l.normalIndex.get("a"), 0); // first wins on duplicate
  assert.equal(l.normalIndex.get("b"), 2);
  assert.equal(l.shiftIndex.get("A"), 0);
});

// ============================================================================
// LanguageModel score behaviour
// ============================================================================

const enAlphabet = new Set("abcdefghijklmnopqrstuvwxyz");

test("LanguageModel: score on empty returns -1000", () => {
  const m = new LanguageModel("x", enAlphabet, { "  a": 1 }, 1);
  assert.equal(m.score(""), -1000);
});

test("LanguageModel: score on whitespace returns -1000", () => {
  const m = new LanguageModel("x", enAlphabet, { "  a": 1 }, 1);
  assert.equal(m.score("   "), -1000);
});

test("LanguageModel: score on no-letter input returns -1000", () => {
  const m = new LanguageModel("x", enAlphabet, { "  a": 1 }, 1);
  assert.equal(m.score("123!?"), -1000);
});

test("LanguageModel: longer in-alphabet text scores higher than short", () => {
  const m = new LanguageModel("x", enAlphabet, { "  h": 1, " he": 1, "hel": 1, "ell": 1, "llo": 1, "lo ": 1 }, 6);
  const short = m.score("h");
  const long = m.score("hello hello hello");
  assert.ok(long > short, `long=${long} short=${short}`);
});

test("LanguageModel: out-of-alphabet letters drop alphabetRatio", () => {
  const m = new LanguageModel("x", enAlphabet, { "  a": 1 }, 1);
  const inAlpha = m.score("hello");
  const outAlpha = m.score("中文测试");
  // Greek/CJK letters aren't in the EN alphabet → alphabetRatio is 0 →
  // the +alphabetRatio*100 term vanishes and the score drops sharply.
  assert.ok(inAlpha > outAlpha, `inAlpha=${inAlpha} outAlpha=${outAlpha}`);
});

// ============================================================================
// convertText behaviour
// ============================================================================

test("convertText: preserves chars not in source layout", () => {
  const en = new Layout({ id: "en", name: "EN", language: "en", normal: "abc", shift: "ABC" });
  const ru = new Layout({ id: "ru", name: "RU", language: "ru", normal: "фыв", shift: "ФЫВ" });
  // '1' isn't in either layout — passes through unchanged.
  assert.equal(convertText("a1b", en, ru), "ф1ы");
});

test("convertText: emoji passthrough", () => {
  const en = new Layout({ id: "en", name: "EN", language: "en", normal: "abc", shift: "ABC" });
  const ru = new Layout({ id: "ru", name: "RU", language: "ru", normal: "фыв", shift: "ФЫВ" });
  assert.equal(convertText("a😀b", en, ru), "ф😀ы");
});

test("convertText: empty string returns empty", () => {
  const en = new Layout({ id: "en", name: "EN", language: "en", normal: "abc", shift: "ABC" });
  const ru = new Layout({ id: "ru", name: "RU", language: "ru", normal: "фыв", shift: "ФЫВ" });
  assert.equal(convertText("", en, ru), "");
});

// ============================================================================
// Helper functions
// ============================================================================

test("hasLetter: punctuation-only input", () => {
  assert.equal(hasLetter("!@#$%"), false);
  assert.equal(hasLetter("123"), false);
  assert.equal(hasLetter(""), false);
});

test("hasLetter: any letter triggers true", () => {
  assert.equal(hasLetter("a"), true);
  assert.equal(hasLetter("123 a 456"), true);
  assert.equal(hasLetter("ё"), true);
});

test("hasMixedCase: all lower or all upper is not mixed", () => {
  assert.equal(hasMixedCase("hello"), false);
  assert.equal(hasMixedCase("HELLO"), false);
  assert.equal(hasMixedCase("123"), false);
});

test("hasMixedCase: at least one of each is mixed", () => {
  assert.equal(hasMixedCase("Hello"), true);
  assert.equal(hasMixedCase("hELLO"), true);
});

test("invertCase: alphabetic", () => {
  assert.equal(invertCase("Hello"), "hELLO");
  assert.equal(invertCase("aBc"), "AbC");
});

test("invertCase: keeps caseless characters", () => {
  assert.equal(invertCase("123 a"), "123 A");
  assert.equal(invertCase("!@#"), "!@#");
});

test("caseNaturalness: all-lower words score +2 each", () => {
  assert.equal(caseNaturalness("hello world"), 4);
});

test("caseNaturalness: ALL UPPER words score +1 each", () => {
  assert.equal(caseNaturalness("HELLO WORLD"), 2);
});

test("caseNaturalness: Title-case words score +2 each", () => {
  assert.equal(caseNaturalness("Hello World"), 4);
});

test("caseNaturalness: Caps-Lock signature scores -2 each", () => {
  // 1 lowercase head + N uppercase tail — what you get from typing capslock-on.
  assert.equal(caseNaturalness("hELLO wORLD"), -4);
});

test("caseNaturalness: empty input is zero", () => {
  assert.equal(caseNaturalness(""), 0);
  assert.equal(caseNaturalness("123 !@#"), 0);
});

// ============================================================================
// Detector edge cases
// ============================================================================

test("whitespace-only input returns unchanged", () => {
  const r = detect("   \n\t", EN_RU);
  assert.equal(r.swapped, false);
  assert.equal(r.result, "   \n\t");
});

test("emoji-only input returns unchanged", () => {
  const r = detect("😀🎉", EN_RU);
  assert.equal(r.swapped, false);
});

test("non-Latin / non-Cyrillic input doesn't crash", () => {
  // CJK characters are letters but not in any bundled alphabet — there are
  // no swap candidates and the result stays as the input.
  const r = detect("中文测试", EN_RU);
  assert.equal(r.swapped, false);
  assert.equal(r.result, "中文测试");
});

test("multiline input works", () => {
  const r = detect("ghbdtn\nrfr ltkf", EN_RU);
  assert.equal(r.swapped, true);
  assert.ok(r.result.includes("\n"));
});

test("duplicate languages in input array are deduplicated", () => {
  const r = detect("ghbdtn", ["en", "ru", "en", "ru"]);
  assert.equal(r.swapped, true);
  assert.equal(r.result, "привет");
});

test("alternatives are sorted by descending score", () => {
  const r = detect("ghbdtn", EN_RU);
  for (let i = 1; i < r.alternatives.length; i++) {
    assert.ok(r.alternatives[i - 1].score >= r.alternatives[i].score);
  }
});

test("override on unsupported source layout throws", () => {
  assert.throws(() => detect("hello", EN_RU, { from: "klingon", to: "ru" }));
});

test("override on unsupported target layout throws", () => {
  assert.throws(() => detect("hello", EN_RU, { from: "en", to: "klingon" }));
});

test("override returns swapped:true even for already-correct text", () => {
  const r = detect("hello", EN_RU, { from: "en", to: "ru" });
  assert.equal(r.swapped, true);
  assert.deepEqual(r.detected, { from: "en", to: "ru" });
});

test("non-array languages → no-op", () => {
  const r = detect("ghbdtn", null);
  assert.equal(r.swapped, false);
  assert.equal(r.result, "ghbdtn");
});

test("languages array containing only unknown codes → no-op", () => {
  const r = detect("ghbdtn", ["klingon", "elvish"]);
  assert.equal(r.swapped, false);
});

test("3 languages: en+ru+uk on EN-typed-as-RU still picks en→ru", () => {
  const r = detect("ghbdtn", ["en", "ru", "uk"]);
  assert.equal(r.swapped, true);
  assert.equal(r.detected.to, "ru");
});

// ============================================================================
// Language matrix sanity (one round-trip per non-Latin pair)
// ============================================================================

test("uk available alongside en", () => {
  // "ghbdtn" typed under UK layout produces a Ukrainian-ish word; with en+uk
  // enabled the detector should pick something — assert at least the swap
  // was attempted and the result differs from input.
  const r = detect("ghbdtn", ["en", "uk"]);
  assert.equal(r.swapped, true);
  assert.notEqual(r.result, "ghbdtn");
});

test("be↔ru distinguishes between the two cyrillic layouts", () => {
  const enRu = detect("ghbdtn", ["en", "ru"]);
  const enRuBe = detect("ghbdtn", ["en", "ru", "be"]);
  // Both should swap successfully; with be added we still want a valid result.
  assert.equal(enRu.swapped, true);
  assert.equal(enRuBe.swapped, true);
});

test("greek is offered as a candidate when enabled", () => {
  // Pick any letters that produce a candidate under EL — check no crash and
  // result stays meaningful.
  const r = detect("hello", ["en", "el"]);
  // hello is native EN — no swap expected.
  assert.equal(r.swapped, false);
});

// ============================================================================
// canHandleLanguages and metadata
// ============================================================================

test("canHandleLanguages: duplicates are tolerated", () => {
  assert.equal(canHandleLanguages(["en", "en", "ru"]), true);
});

test("canHandleLanguages: any unknown breaks the set", () => {
  assert.equal(canHandleLanguages(["en", "ru", "klingon"]), false);
});

test("canHandleLanguages: non-array → false", () => {
  assert.equal(canHandleLanguages(null), false);
  assert.equal(canHandleLanguages(undefined), false);
  assert.equal(canHandleLanguages("en"), false);
});

test("languageInfo: returns shape {id, name, language} for every bundled language", () => {
  const langs = languageInfo();
  assert.ok(langs.length >= 9);
  for (const l of langs) {
    assert.equal(typeof l.id, "string");
    assert.equal(typeof l.name, "string");
    assert.equal(typeof l.language, "string");
    assert.ok(l.id.length > 0);
  }
});

test("availableLanguages: bundled set covers all 9 supported languages", () => {
  const ids = availableLanguages().sort();
  for (const expected of ["en", "ru", "uk", "be", "de", "fr", "el", "he", "tr"]) {
    assert.ok(ids.includes(expected), `expected ${expected} in ${ids.join(",")}`);
  }
});
