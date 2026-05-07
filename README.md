# VibeNest Switcher

[![tests](https://github.com/NikitaBabenko/Switcher/actions/workflows/test.yml/badge.svg)](https://github.com/NikitaBabenko/Switcher/actions/workflows/test.yml)

🌐 Live: <https://vibenest.net>

Chrome extension that fixes text typed in the wrong keyboard layout.

The shipped product is the **Chrome extension** at [`extension/`](extension/). It runs **fully offline** — the layout-detection engine and 9 trigram language models are bundled inside the extension; no text ever leaves the browser. See [`extension/README.md`](extension/README.md) and [`extension/PRIVACY.md`](extension/PRIVACY.md).

The algorithm is LLM-free: char-by-char transposition through layout tables + a char-trigram language model that picks the direction.

## Layout

```
extension/
├─ manifest.json              MV3 manifest. Lists content scripts in load order.
├─ background.js              Service worker. Owns the message bus + clipboard fallback.
├─ content.js                 Content script shell. Routes messages to adapters.
├─ content/                   Per-site adapters, insertion ladder, autocorrect.
├─ popup.html / popup.js      Toolbar popup.
├─ options.html / options.js  Settings page.
├─ config.js                  Storage wrapper + DEFAULTS + isHostAllowed.
├─ lib/
│   ├─ detector.js            Layout detector + LanguageModel + Caps Lock heuristic.
│   ├─ data.js                AUTO-GENERATED — bundled trigram counts (9 langs).
│   └─ build-models.mjs       Regenerates data.js from data/{layouts,wordlists}/.
├─ data/
│   ├─ layouts/*.json         Source-of-truth layout tables (46 chars normal + shift each).
│   └─ wordlists/*.txt        Source-of-truth wordlists used to train the trigram models.
├─ tools/
│   └─ package.mjs            Dependency-free zip writer used by `npm run package`.
└─ icons/                     16/32/48/128 px PNGs.
```

The data files in `extension/data/layouts/` and `extension/data/wordlists/` are the single source of truth; `extension/lib/data.js` is regenerated from them.

## Running locally

1. Open `chrome://extensions/` → enable Developer mode.
2. **Load unpacked** → pick the `extension/` folder.

To regenerate the bundled trigram model from the wordlists:

```
node extension/lib/build-models.mjs   # writes extension/lib/data.js
```

To package the extension into a Chrome Web Store-ready zip:

```
cd extension
npm test            # 199 Node tests
npm run package     # writes extension/dist/vibenest-switcher-<version>.zip
```

See [`extension/README.md`](extension/README.md#publishing-to-the-chrome-web-store) for the publishing checklist.

## Supported languages

`en, ru, uk, be, de, fr, el, he, tr`. Each language ships top-3000 words: 8 of them come from [hermitdave/FrequencyWords](https://github.com/hermitdave/FrequencyWords) (frequency-sorted on OpenSubtitles 2018), `be` is taken from the LibreOffice dictionary [be-official.dic](https://github.com/LibreOffice/dictionaries/tree/master/be_BY).

Adding a new language is two files:
1. `extension/data/layouts/<code>.json` — `id`, `name`, `language`, `normal` (46 chars), `shift` (46 chars).
2. `extension/data/wordlists/<code>.txt` — a wordlist of common words (one per line).

After adding, regenerate the bundle: `node extension/lib/build-models.mjs`.

The scoring alphabet is computed automatically from the layout characters.

## Caps Lock heuristic

The detector tries not just every layout, but also the case-inverted variant (so input that looks like `hELLO` — a single lowercase head followed by uppercase — gets flipped to `Hello`). When "as typed" and "case-inverted" tie on score, the variant with the more natural case pattern wins — Title-case or all-lower beat "1 lower + N upper" (the Caps Lock signature). Intentional ALL CAPS is not flipped, since that input has no mixed case to begin with.

## Tests

```
cd extension
npm test
```

199 Node tests cover the detector engine, host-policy logic, per-site adapters, autocorrect heuristics, the insertion ladder, undo memory, and the packaging script.

## CI

GitHub Actions runs `npm test` and `npm run package` on every push and pull request to `main`. The packaged extension zip is uploaded as a build artifact you can grab from the run page — see [`.github/workflows/test.yml`](.github/workflows/test.yml).
