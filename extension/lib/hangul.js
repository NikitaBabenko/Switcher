// Hangul (Korean) decomposition and composition.
//
// The detector engine transposes character-by-character through layout pairs.
// Korean breaks the simple model: keystrokes produce compatibility jamo, but
// the Korean IME composes them into Hangul syllable blocks (각 syllable = an
// initial consonant + medial vowel + optional final consonant). What the user
// sees in a text field is composed Hangul, not the raw keystrokes.
//
// To make wrong-layout fix work for Korean we:
//   1. Decompose any Hangul syllables in the input back to their keystroke
//      sequence (using compatibility jamo, the form that appears on physical
//      keys), then transpose normally.
//   2. After transposing into Korean, recompose the jamo sequence back to
//      Hangul syllables for display.
//
// The decomposition splits compound vowels (ㅗ+ㅏ → ㅘ in display, but typed as
// two keystrokes) and compound finals (ㄱ+ㅅ → ㄳ) into their constituent
// keystrokes — this matches what the user actually pressed and keeps every
// jamo within the layout's alphabet for trigram scoring.

const SYL_START = 0xAC00;
const SYL_END = 0xD7A3;

const L_COUNT = 19;
const V_COUNT = 21;
const T_COUNT = 28;
const N_COUNT = V_COUNT * T_COUNT; // 588

// Initial consonants — compatibility jamo, in Hangul-syllable index order (L = 0..18).
const INITIALS = [
  "ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ",
  "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ",
];

// Medial vowels — keystroke decomposition (1 or 2 compatibility jamo).
// Position = V index (0..20). Compound vowels expand to two keystrokes.
const MEDIALS = [
  "ㅏ", "ㅐ", "ㅑ", "ㅒ", "ㅓ", "ㅔ", "ㅕ", "ㅖ",
  "ㅗ", "ㅗㅏ", "ㅗㅐ", "ㅗㅣ",
  "ㅛ", "ㅜ", "ㅜㅓ", "ㅜㅔ", "ㅜㅣ", "ㅠ",
  "ㅡ", "ㅡㅣ", "ㅣ",
];

// Final consonants — index 0 is "no final", 1..27 are keystroke-decomposed.
// Compound finals (e.g. ㄳ = ㄱ+ㅅ) expand to two keystrokes.
const FINALS = [
  "", "ㄱ", "ㄲ", "ㄱㅅ", "ㄴ", "ㄴㅈ", "ㄴㅎ", "ㄷ",
  "ㄹ", "ㄹㄱ", "ㄹㅁ", "ㄹㅂ", "ㄹㅅ", "ㄹㅌ", "ㄹㅍ", "ㄹㅎ",
  "ㅁ", "ㅂ", "ㅂㅅ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅊ",
  "ㅋ", "ㅌ", "ㅍ", "ㅎ",
];

const INITIAL_INDEX = new Map();
INITIALS.forEach((c, i) => INITIAL_INDEX.set(c, i));

const MEDIAL_INDEX = new Map();
MEDIALS.forEach((c, i) => {
  if (c.length === 1) MEDIAL_INDEX.set(c, i);
});

const COMPOUND_VOWELS = new Map();
MEDIALS.forEach((c, i) => {
  if (c.length === 2) COMPOUND_VOWELS.set(c, i);
});

const FINAL_INDEX = new Map();
FINALS.forEach((c, i) => {
  if (i > 0 && c.length === 1) FINAL_INDEX.set(c, i);
});

const COMPOUND_FINALS = new Map();
FINALS.forEach((c, i) => {
  if (c.length === 2) COMPOUND_FINALS.set(c, i);
});

export function hasHangul(text) {
  if (!text) return false;
  for (const ch of text) {
    const code = ch.codePointAt(0);
    if (code >= SYL_START && code <= SYL_END) return true;
  }
  return false;
}

export function decomposeHangul(text) {
  if (!text) return text;
  let out = "";
  for (const ch of text) {
    const code = ch.codePointAt(0);
    if (code >= SYL_START && code <= SYL_END) {
      const base = code - SYL_START;
      const L = Math.floor(base / N_COUNT);
      const V = Math.floor(base / T_COUNT) % V_COUNT;
      const T = base % T_COUNT;
      out += INITIALS[L];
      out += MEDIALS[V];
      if (T > 0) out += FINALS[T];
    } else {
      out += ch;
    }
  }
  return out;
}

export function composeHangul(text) {
  if (!text) return text;
  const chars = [...text];
  let out = "";
  let i = 0;

  while (i < chars.length) {
    const c1 = chars[i];
    const L = INITIAL_INDEX.get(c1);

    // Not an initial consonant — emit unchanged.
    if (L === undefined) {
      out += c1;
      i++;
      continue;
    }

    // Initial needs at least one following vowel to form a syllable.
    const c2 = chars[i + 1];
    let V = c2 !== undefined ? MEDIAL_INDEX.get(c2) : undefined;
    if (V === undefined) {
      out += c1;
      i++;
      continue;
    }

    let consumed = 2;

    // Greedy compound-vowel match (e.g. ㅗ+ㅏ → ㅘ).
    if (i + 2 < chars.length) {
      const cv = COMPOUND_VOWELS.get(c2 + chars[i + 2]);
      if (cv !== undefined) {
        V = cv;
        consumed = 3;
      }
    }

    // Optional final consonant. A consonant followed immediately by a vowel
    // belongs to the *next* syllable, not the current one's final.
    let T = 0;
    if (i + consumed < chars.length) {
      const cF = chars[i + consumed];
      const f = FINAL_INDEX.get(cF);
      if (f !== undefined) {
        const cAfter = chars[i + consumed + 1];
        const afterIsVowel = cAfter !== undefined && MEDIAL_INDEX.has(cAfter);
        if (!afterIsVowel) {
          T = f;
          consumed++;
          // Greedy compound-final match (e.g. ㄱ+ㅅ → ㄳ), but only if the
          // second consonant is not the start of a new syllable.
          if (i + consumed < chars.length) {
            const cF2 = chars[i + consumed];
            const cf = COMPOUND_FINALS.get(cF + cF2);
            if (cf !== undefined) {
              const cAfter2 = chars[i + consumed + 1];
              const after2IsVowel = cAfter2 !== undefined && MEDIAL_INDEX.has(cAfter2);
              if (!after2IsVowel) {
                T = cf;
                consumed++;
              }
            }
          }
        }
      }
    }

    const code = SYL_START + L * N_COUNT + V * T_COUNT + T;
    out += String.fromCharCode(code);
    i += consumed;
  }

  return out;
}

// Test-only helpers.
export const __testInternals = {
  INITIALS,
  MEDIALS,
  FINALS,
  SYL_START,
  SYL_END,
};
