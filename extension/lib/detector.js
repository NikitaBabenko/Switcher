// JS port of Switcher.Core: LayoutConverter + LanguageModel + LayoutDetector.
// Mirrors the algorithm in src/Switcher.Core/ exactly so offline results match
// the backend response shape (`/api/convert`).

import { LANGUAGES } from "./data.js";

const LETTER = /\p{L}/u;
const isLetter = (ch) => LETTER.test(ch);

class Layout {
  constructor({ id, name, language, normal, shift }) {
    if (normal.length !== shift.length) {
      throw new Error(`Layout '${id}': normal (${normal.length}) and shift (${shift.length}) must have equal length.`);
    }
    this.id = id;
    this.name = name;
    this.language = language;
    this.normal = normal;
    this.shift = shift;
    this.normalIndex = new Map();
    this.shiftIndex = new Map();
    for (let i = 0; i < normal.length; i++) {
      if (!this.normalIndex.has(normal[i])) this.normalIndex.set(normal[i], i);
    }
    for (let i = 0; i < shift.length; i++) {
      if (!this.shiftIndex.has(shift[i])) this.shiftIndex.set(shift[i], i);
    }
    const alphabet = new Set();
    for (const c of normal) if (isLetter(c)) alphabet.add(c.toLowerCase());
    for (const c of shift) if (isLetter(c)) alphabet.add(c.toLowerCase());
    this.alphabet = alphabet;
  }
}

function convertText(text, from, to) {
  if (!text) return text;
  let out = "";
  for (const c of text) {
    const i = from.normalIndex.get(c);
    if (i !== undefined && i < to.normal.length) {
      out += to.normal[i];
      continue;
    }
    const j = from.shiftIndex.get(c);
    if (j !== undefined && j < to.shift.length) {
      out += to.shift[j];
      continue;
    }
    out += c;
  }
  return out;
}

class LanguageModel {
  constructor(language, alphabet, counts, total) {
    this.language = language;
    this.alphabet = alphabet instanceof Set ? alphabet : new Set(alphabet);
    const distinct = Object.keys(counts).length;
    const vocab = Math.max(distinct, 1);
    const denom = total + vocab + 1;
    this.floorLogProb = Math.log(1 / denom);
    this.logProb = new Map();
    for (const [tri, c] of Object.entries(counts)) {
      this.logProb.set(tri, Math.log((c + 1) / denom));
    }
  }

  score(text) {
    if (!text || !text.trim()) return -1000;
    const lower = text.toLowerCase();
    let alpha = 0;
    let inAlphabet = 0;
    for (const c of lower) {
      if (isLetter(c)) {
        alpha++;
        if (this.alphabet.has(c)) inAlphabet++;
      }
    }
    if (alpha === 0) return -1000;
    const alphabetRatio = inAlphabet / alpha;

    const padded = "  " + lower + " ";
    let score = 0;
    let n = 0;
    let observed = 0;
    for (let i = 0; i + 3 <= padded.length; i++) {
      const tri = padded.substring(i, i + 3);
      let relevant = true;
      for (let k = 0; k < 3; k++) {
        const ch = tri[k];
        if (ch === " ") continue;
        if (!isLetter(ch)) { relevant = false; break; }
        if (!this.alphabet.has(ch)) { relevant = false; break; }
      }
      if (!relevant) continue;
      const lp = this.logProb.get(tri);
      if (lp !== undefined) {
        score += lp;
        observed++;
      } else {
        score += this.floorLogProb;
      }
      n++;
    }
    const trigramAvg = n > 0 ? score / n : this.floorLogProb;
    const observedRatio = n > 0 ? observed / n : 0;
    const lengthBonus = Math.log(1 + n) * 5;
    return alphabetRatio * 100 + observedRatio * 30 + lengthBonus + trigramAvg;
  }
}

let _registry = null;
function registry() {
  if (_registry) return _registry;
  const layouts = {};
  const models = {};
  for (const [id, m] of Object.entries(LANGUAGES)) {
    const layout = new Layout(m.layout);
    layouts[id] = layout;
    models[id] = new LanguageModel(id, layout.alphabet, m.counts, m.total);
  }
  _registry = { layouts, models };
  return _registry;
}

function hasLetter(text) {
  for (const c of text) if (isLetter(c)) return true;
  return false;
}

function hasMixedCase(text) {
  let hasUpper = false;
  let hasLower = false;
  for (const c of text) {
    if (c >= "A" && c <= "Z") hasUpper = true;
    else if (c >= "a" && c <= "z") hasLower = true;
    else {
      const u = c.toUpperCase();
      const l = c.toLowerCase();
      if (u !== l) {
        if (c === u) hasUpper = true;
        if (c === l) hasLower = true;
      }
    }
    if (hasUpper && hasLower) return true;
  }
  return false;
}

function invertCase(text) {
  let out = "";
  for (const c of text) {
    const u = c.toUpperCase();
    const l = c.toLowerCase();
    if (u === l) { out += c; continue; }
    out += c === u ? l : u;
  }
  return out;
}

function caseNaturalness(text) {
  let total = 0;
  let wordUpper = 0;
  let wordLower = 0;
  let wordLetters = 0;
  let firstIsUpper = false;
  let firstSet = false;

  const flush = () => {
    if (wordLetters === 0) return;
    if (wordUpper === 0) total += 2;                          // all lower
    else if (wordLower === 0) total += 1;                     // ALL UPPER
    else if (firstIsUpper && wordUpper === 1) total += 2;     // Title
    else if (!firstIsUpper && wordLower === 1) total -= 2;    // Caps-Lock pattern
    wordUpper = 0;
    wordLower = 0;
    wordLetters = 0;
    firstSet = false;
  };

  for (const c of text) {
    if (isLetter(c)) {
      wordLetters++;
      const u = c.toUpperCase();
      const l = c.toLowerCase();
      const isUpper = u !== l && c === u;
      const isLower = u !== l && c === l;
      if (!firstSet) { firstIsUpper = isUpper; firstSet = true; }
      if (isUpper) wordUpper++;
      else if (isLower) wordLower++;
    } else {
      flush();
    }
  }
  flush();
  return total;
}

function addCandidates(candidates, text, langs, reg) {
  // Native (no swap) candidates — keep input as-is, score under each language.
  for (const lang of langs) {
    const score = reg.models[lang].score(text);
    candidates.push({ text, from: lang, to: lang, score });
  }
  // Swap candidates.
  for (const from of langs) {
    for (const to of langs) {
      if (from === to) continue;
      const fromL = reg.layouts[from];
      const toL = reg.layouts[to];
      const converted = convertText(text, fromL, toL);
      if (converted === text) continue;
      const score = reg.models[to].score(converted);
      candidates.push({ text: converted, from, to, score });
    }
  }
}

export function availableLanguages() {
  return Object.keys(LANGUAGES);
}

export function languageInfo() {
  return Object.entries(LANGUAGES).map(([id, m]) => ({
    id,
    name: m.layout.name,
    language: m.layout.language,
  }));
}

// Returns { result, swapped, detected, alternatives } with the same shape as
// the backend POST /api/convert response.
export function detect(text, enabledLanguages, override = null) {
  if (!text) return { result: text, swapped: false, detected: null, alternatives: [] };

  const reg = registry();

  if (override) {
    const fromL = reg.layouts[override.from];
    const toL = reg.layouts[override.to];
    if (!fromL || !toL) {
      throw new Error(`Override layout(s) not registered: ${override.from} → ${override.to}`);
    }
    const converted = convertText(text, fromL, toL);
    return {
      result: converted,
      swapped: true,
      detected: { from: override.from, to: override.to },
      alternatives: [],
    };
  }

  if (!hasLetter(text)) {
    return { result: text, swapped: false, detected: null, alternatives: [] };
  }

  const seen = new Set();
  const langs = [];
  for (const l of enabledLanguages || []) {
    if (reg.layouts[l] && !seen.has(l)) {
      seen.add(l);
      langs.push(l);
    }
  }
  if (langs.length < 2) {
    return { result: text, swapped: false, detected: null, alternatives: [] };
  }

  const candidates = [];
  addCandidates(candidates, text, langs, reg);
  if (hasMixedCase(text)) {
    addCandidates(candidates, invertCase(text), langs, reg);
  }

  candidates.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return caseNaturalness(b.text) - caseNaturalness(a.text);
  });

  const best = candidates[0];
  const alternatives = candidates.slice(1, 4).map((c) => ({
    text: c.text,
    from: c.from,
    to: c.to,
    score: c.score,
  }));

  const swapped = best.from !== best.to || best.text !== text;
  const detected = best.from !== best.to ? { from: best.from, to: best.to } : null;
  return { result: best.text, swapped, detected, alternatives };
}

// True when every language in `langs` is available in the bundled models.
export function canHandleLanguages(langs) {
  if (!Array.isArray(langs) || langs.length === 0) return false;
  for (const l of langs) {
    if (!LANGUAGES[l]) return false;
  }
  return true;
}
