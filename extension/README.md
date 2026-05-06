# VibeNest Switcher — Chrome Extension

Manifest V3 extension that fixes text typed in the wrong keyboard layout. Runs
**fully offline by default** — the layout-detection engine, including a
char-trigram language model trained on 9 wordlists, is bundled into the
extension. No data leaves the browser unless the user explicitly enables the
remote API fallback in Options.

## Architecture

```
extension/
├─ manifest.json              MV3 manifest. Lists content scripts in load order.
├─ background.js              Service worker. Owns the message bus + clipboard fallback.
├─ content.js                 Content script shell. Routes messages to adapters; holds undo memory.
├─ content/
│   ├─ replace.js             Insertion ladder (focus → execCommand → InputEvent).
│   │                         Shadow DOM and same-origin iframe walking.
│   ├─ adapters.js            Per-site adapter registry (X, FB, VK, IG, …).
│   └─ autocorrect.js         Optional input-event listener for Punto-style fixes.
├─ popup.html / popup.js      Toolbar popup: site override, decrypt-focused, undo, paste-and-decrypt.
├─ options.html / options.js  Settings: API toggle, languages, behaviour, site policy.
├─ config.js                  Storage wrapper + DEFAULTS + isHostAllowed.
├─ lib/
│   ├─ detector.js            JS port of LayoutDetector + LanguageModel + Caps Lock heuristic.
│   ├─ data.js                AUTO-GENERATED — bundled trigram counts (9 langs, ~270 KB).
│   ├─ build-models.mjs       Regenerates data.js from data/{layouts,wordlists}/.
│   ├─ test-helpers.mjs       Shared VM loader + chrome/location/document mocks for tests.
│   └─ *.test.mjs             190 Node tests (see § Tests).
├─ data/
│   ├─ layouts/*.json         Source-of-truth layout tables (46 chars normal + shift each).
│   └─ wordlists/*.txt        Source-of-truth wordlists used to train the trigram models.
├─ tools/
│   └─ package.mjs            Dependency-free zip writer used by `npm run package`.
└─ icons/                     16/32/48/128 px PNGs.
```

## Message protocol

Content scripts ↔ service worker speak via `chrome.runtime.sendMessage` /
`chrome.tabs.sendMessage`. Stable types:

| Type | Direction | Purpose |
|---|---|---|
| `CONVERT_TEXT` | content → BG | Convert a string. BG runs the local detector first; falls back to the API only if the user opts in and the local detector can't cover all requested languages. |
| `GET_SELECTION` | BG → content | Return the currently selected text. Legacy path for the hotkey/context menu. |
| `REPLACE_SELECTION` | BG → content | Replace the current selection with a literal string. Legacy fallback. |
| `GET_ADAPTER_INFO` | popup → content | Returns `{ id, hostname, hasEditable, editableTag, canUndo }` for the Detected line. |
| `REPLACE_IN_COMPOSER` | popup/BG → content | Pick adapter → read text → ask BG to convert → write back. Returns `{ ok, reason?, result?, detected?, adapter, mode, canUndo }`. |
| `UNDO_REPLACE` | popup → content | Revert the last successful in-place replacement (per-page memory). |
| `SHOW_TOAST` | BG → content | Render a transient toast in the page corner. |

## Adapter framework

An adapter is a plain object with this shape:

```js
{
  id: "twitter",
  match: (hostname, pathname) => boolean,
  selectors: ["…", "…"],         // CSS selectors for the composer root
  getEditable: () => Element | null,
  getText: (el) => string,
  replaceSelection: (el, text) => { ok, reason? },
  replaceAll: (el, text) => { ok, reason? },
}
```

`pickAdapter(overrideId)` matches the registry top-down against the current
location; the first matching adapter wins. **Order matters** — more specific
adapters (e.g. `vk-im` for `vk.com/im`) must come before more general ones
(`vk` for `vk.com`).

The default `replaceSelection`/`replaceAll` delegate to
`__SwitcherReplace.replaceInElement` (the insertion ladder in `replace.js`):

1. `focus()` the element.
2. Establish a selection (range or select-all).
3. Try `document.execCommand("insertText", false, t)` — the only synthetic
   input that fires `beforeinput`/`input` with `isTrusted=true`, which
   Draft.js / Lexical / Slate / ProseMirror accept as a real keystroke.
4. On `false`: `Range.deleteContents()` + `insertNode(textNode)` + dispatched
   `InputEvent("input", { inputType:"insertText", composed:true })`.
5. Return `{ ok: false, reason }` so background can fall back to clipboard.

### Adding a new site

1. Open the site, inspect the composer, find a stable selector.
2. Add an entry to `registry` in [`content/adapters.js`](content/adapters.js):
   ```js
   makeAdapter("foo", hostMatch("foo.com"), [
     '[role="textbox"][contenteditable="true"]',
   ])
   ```
3. Add the corresponding `<option value="foo">` to the override `<select>` in
   [`popup.html`](popup.html).
4. Reload the extension (`chrome://extensions` → reload), test on the site.

If the framework rejects `execCommand("insertText")` (rare — Draft.js, Lexical,
Slate, ProseMirror, and plain contenteditable all handle it), provide a custom
`replaceSelection`/`replaceAll` on the adapter. Otherwise the defaults work.

## Detector engine

`lib/detector.js` runs the layout-detection algorithm entirely in the browser:
transpose-then-score across every layout pair, with a Caps Lock heuristic and a
case-naturalness tie-breaker. `lib/data.js` is auto-generated from the bundled
wordlists and layout tables.

To regenerate after changing wordlists or layouts:

```
node extension/lib/build-models.mjs
node --test extension/lib/detector.test.mjs extension/lib/config.test.mjs
```

The build script reads from `extension/data/layouts/*.json` and
`extension/data/wordlists/*.txt` and writes a single ESM module exporting
`LANGUAGES = { id: { layout, alphabet, total, counts }, … }`.

## Tests

```
cd extension
npm test
```

190 Node tests across seven files:

| File | Covers |
|---|---|
| `lib/detector.test.mjs` | JS engine: 62 tests — Layout invariants, `LanguageModel.score`, helpers (`hasMixedCase`, `invertCase`, `caseNaturalness`), `convertText`, detector edge cases (whitespace, emoji, CJK, multi-line), language matrix, `availableLanguages`/`languageInfo` shape. |
| `lib/config.test.mjs` | `isHostAllowed` policy: all three modes, suffix matching, case-insensitivity, edge cases. |
| `lib/adapters.test.mjs` | `pickAdapter` registry order (vk-im before vk), every site adapter, override behaviour, Mastodon DOM heuristic. |
| `lib/autocorrect.test.mjs` | `extractLastWordInput`, `extractLastWordContentEditable`, `isAutoCorrectEligible` (password/OTP/cc-* skip, readOnly, contenteditable). |
| `lib/replace.test.mjs` | `isInputLike`, `isContentEditable`, `inputLikeHasSelection`, `getInputLikeSelectionText`, `dispatchInputEvent` shape, `replaceInElement` reasons. |
| `lib/content.test.mjs` | Undo memory: `rememberChange` / `canUndo` / `undoLastChange` for input-whole, input-selection, contenteditable, element-gone. |
| `lib/package.test.mjs` | `shouldInclude` allow/deny matrix; live-tree assertion that the zip ships exactly the right files. |

Tests for IIFE content-scripts use `node:vm` to load the file with mocked
`globalThis`/`location`/`document`/`chrome`. There is no production-code
change for testability beyond a single `__testInternals` export in
`detector.js` (helpers and constructors), a single `__SwitcherAutocorrectInternals`
export at the end of the autocorrect IIFE, and an `if (import.meta.url === …)`
main-guard in `tools/package.mjs` so it can be both run as a script and
imported in tests.

## Loading unpacked

1. `chrome://extensions/` → enable Developer mode.
2. **Load unpacked** → pick the `extension/` folder.
3. Test pages: any `<textarea>`-bearing page works for the generic adapter.

## Notes for review

- No external CDN/script. Everything is local files.
- No analytics, no telemetry, no remote logging.
- `host_permissions` is `<all_urls>` because the extension acts on whatever
  field the user is currently typing into. The content script attaches
  passively and only converts on user-initiated actions.
- Auto-correct is opt-in (off by default) and skips fields that look like
  passwords, OTP codes, or card numbers (via `<input type=password>`,
  `autocomplete=current-password`, `autocomplete=one-time-code`,
  `autocomplete=cc-*`).

## Publishing to the Chrome Web Store

```
cd extension
npm test                # 190 Node tests, all green
npm run package         # writes extension/dist/vibenest-switcher-<version>.zip
```

The packaging script excludes dev-only files (`tools/`, `*.test.mjs`,
`build-models.mjs`, `data/`, `package.json`, `README.md`, `PRIVACY.md`,
`node_modules/`, `dist/`). Only the files Chrome actually needs end up in the
zip — verified with `python3 -m zipfile -l dist/<file>.zip`.

Submission checklist:

1. **Bump `version`** in [manifest.json](manifest.json) (semver). The Web Store
   refuses uploads with a version equal to or lower than what's already live.
2. **Run** `npm test && npm run package`.
3. **Sanity-check the zip**: load it unpacked (`chrome://extensions` →
   developer mode → drag the zip onto the page) and exercise:
   - Toolbar popup → "Decrypt focused field" on a `<textarea>`.
   - Toolbar popup → paste-and-decrypt path.
   - `Ctrl+Shift+L` and right-click context-menu paths.
   - Undo button after a successful decrypt.
   - Site policy: add a host to the blacklist, confirm the popup says
     "excluded by policy".
   - Auto-correct (Options → enable, then type `ghbdtn ` in a textarea).
4. **Open** the [Chrome Web Store developer dashboard]
   (https://chrome.google.com/webstore/devconsole) → Item → Package → upload
   the zip.
5. **Privacy practices** form: link to [`PRIVACY.md`](PRIVACY.md). Justify the
   permissions (each row in PRIVACY.md's permission table maps to one of the
   form's questions — copy-paste the rationale).
6. **Single-purpose statement**: "Fix text typed in the wrong keyboard
   layout. Detection runs entirely on the user's device by default."
7. **Screenshots** (1280×800 or 640×400, max 5):
   - Popup with the override `<select>` open and a successful decrypt.
   - Options page showing the Privacy + Site policy sections.
   - In-page toast after a Twitter / Slack / WhatsApp Web decrypt.
   - Auto-correct in action (textarea before/after).
   - Optional: the context-menu item.
8. **Promo tile** (440×280): use the existing 128 px icon + tagline.
9. **Listing copy**: pull from the description in `manifest.json` and the
   "Short version" of `PRIVACY.md`. Mention the offline-by-default guarantee
   prominently — that's the differentiator.
10. **Submit for review**. Typical turnaround is 1–3 business days.

After acceptance, the same `npm run package` workflow handles updates.
