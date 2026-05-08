// Run with: node --test extension/lib/hangul.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { hasHangul, decomposeHangul, composeHangul } from "./hangul.js";

// ============================================================================
// hasHangul
// ============================================================================

test("hasHangul: true for composed Hangul syllables", () => {
  assert.equal(hasHangul("안녕"), true);
  assert.equal(hasHangul("한국어"), true);
});

test("hasHangul: false for empty / null / Latin / digits / punctuation", () => {
  assert.equal(hasHangul(""), false);
  assert.equal(hasHangul(null), false);
  assert.equal(hasHangul(undefined), false);
  assert.equal(hasHangul("hello"), false);
  assert.equal(hasHangul("12345"), false);
  assert.equal(hasHangul("!@#"), false);
});

test("hasHangul: false for compatibility jamo (not the syllable block)", () => {
  // Compatibility jamo (U+3130 range) are NOT Hangul syllables — only the
  // U+AC00..U+D7A3 block counts.
  assert.equal(hasHangul("ㅇㅏㄴ"), false);
});

test("hasHangul: true when at least one syllable is present", () => {
  assert.equal(hasHangul("hello 안녕"), true);
  assert.equal(hasHangul("안 ㅇ"), true);
});

// ============================================================================
// decomposeHangul — round-trips
// ============================================================================

test("decomposeHangul: simple syllable 안 → ㅇㅏㄴ", () => {
  assert.equal(decomposeHangul("안"), "ㅇㅏㄴ");
});

test("decomposeHangul: 안녕 → ㅇㅏㄴㄴㅕㅇ", () => {
  assert.equal(decomposeHangul("안녕"), "ㅇㅏㄴㄴㅕㅇ");
});

test("decomposeHangul: word with no final 가 → ㄱㅏ", () => {
  assert.equal(decomposeHangul("가"), "ㄱㅏ");
});

test("decomposeHangul: compound vowel 와 → ㅇㅗㅏ", () => {
  // 와 is composed of initial ㅇ + medial ㅘ (which is the compound ㅗㅏ).
  assert.equal(decomposeHangul("와"), "ㅇㅗㅏ");
});

test("decomposeHangul: compound final 값 → ㄱㅏㅂㅅ", () => {
  assert.equal(decomposeHangul("값"), "ㄱㅏㅂㅅ");
});

test("decomposeHangul: compound final 닭 → ㄷㅏㄹㄱ", () => {
  assert.equal(decomposeHangul("닭"), "ㄷㅏㄹㄱ");
});

test("decomposeHangul: passes non-Hangul through unchanged", () => {
  assert.equal(decomposeHangul("hello"), "hello");
  assert.equal(decomposeHangul("12345"), "12345");
  assert.equal(decomposeHangul("hello 안녕!"), "hello ㅇㅏㄴㄴㅕㅇ!");
});

test("decomposeHangul: empty / null", () => {
  assert.equal(decomposeHangul(""), "");
  assert.equal(decomposeHangul(null), null);
  assert.equal(decomposeHangul(undefined), undefined);
});

// ============================================================================
// composeHangul
// ============================================================================

test("composeHangul: ㅇㅏㄴ → 안", () => {
  assert.equal(composeHangul("ㅇㅏㄴ"), "안");
});

test("composeHangul: ㅇㅏㄴㄴㅕㅇ → 안녕 (syllable boundary by lookahead)", () => {
  // The middle ㄴ is followed by ㄴㅕ — so it must be the final of 안, with the
  // second ㄴ starting the next syllable 녕.
  assert.equal(composeHangul("ㅇㅏㄴㄴㅕㅇ"), "안녕");
});

test("composeHangul: compound vowel ㅇㅗㅏ → 와", () => {
  assert.equal(composeHangul("ㅇㅗㅏ"), "와");
});

test("composeHangul: compound final ㄱㅏㅂㅅ → 값", () => {
  assert.equal(composeHangul("ㄱㅏㅂㅅ"), "값");
});

test("composeHangul: orphan vowel passes through", () => {
  // Vowels can't start a syllable on their own — pass through as compat.
  assert.equal(composeHangul("ㅏ"), "ㅏ");
});

test("composeHangul: orphan consonant passes through when no following vowel", () => {
  assert.equal(composeHangul("ㅎ"), "ㅎ");
  assert.equal(composeHangul("ㅎㄱ"), "ㅎㄱ");
});

test("composeHangul: passes non-jamo through unchanged", () => {
  assert.equal(composeHangul("hello"), "hello");
  assert.equal(composeHangul("12345!@#"), "12345!@#");
});

test("composeHangul: empty / null", () => {
  assert.equal(composeHangul(""), "");
  assert.equal(composeHangul(null), null);
});

// ============================================================================
// Round-trip: decompose → compose preserves natural Korean text
// ============================================================================

test("round-trip: 안녕하세요", () => {
  const word = "안녕하세요";
  assert.equal(composeHangul(decomposeHangul(word)), word);
});

test("round-trip: 한국어 (Korean language)", () => {
  const word = "한국어";
  assert.equal(composeHangul(decomposeHangul(word)), word);
});

test("round-trip: words with compound finals (값 닭)", () => {
  for (const word of ["값", "닭", "삶", "넓다", "맑다"]) {
    assert.equal(composeHangul(decomposeHangul(word)), word, `round-trip failed for ${word}`);
  }
});

test("round-trip: words with compound vowels (와요 의사 외국)", () => {
  for (const word of ["와요", "의사", "외국", "최선"]) {
    assert.equal(composeHangul(decomposeHangul(word)), word, `round-trip failed for ${word}`);
  }
});

test("round-trip: paragraph with mixed scripts", () => {
  const text = "Hello 안녕! 한국어 is great. 12345.";
  // Non-Hangul portions must pass through untouched.
  assert.equal(composeHangul(decomposeHangul(text)), text);
});
