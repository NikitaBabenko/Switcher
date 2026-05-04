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
├─ content.js                 Content script shell. Routes messages to adapters.
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
│   ├─ build-models.mjs       Regenerates data.js from src/Switcher.Core/.
│   ├─ detector.test.mjs      Parity tests for the detector.
│   └─ config.test.mjs        Tests for isHostAllowed + DEFAULTS.
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

`lib/detector.js` is a JS port of [`src/Switcher.Core/`](../src/Switcher.Core/).
It mirrors the C# algorithm (transpose-then-score, Caps Lock heuristic, case
naturalness tie-breaker) and returns the same response shape as the backend
`POST /api/convert`. The data file `lib/data.js` is auto-generated from the
.NET project's wordlists and layout tables.

To regenerate after changing wordlists or layouts:

```
node extension/lib/build-models.mjs
node --test extension/lib/detector.test.mjs extension/lib/config.test.mjs
```

The build script reads from `src/Switcher.Core/Layouts/*.json` and
`src/Switcher.Core/LanguageModels/*.txt` and writes a single ESM module
exporting `LANGUAGES = { id: { layout, alphabet, total, counts }, … }`.

## Tests

```
node --test extension/lib/detector.test.mjs extension/lib/config.test.mjs
```

29 Node tests cover the parity-critical detector cases (en↔ru, native input,
punctuation, override, Caps Lock, ALL CAPS, multi-language) and the host
policy (`isHostAllowed` with all three modes, suffix matching, edge cases).

The C# test suite at `src/Switcher.Tests/` (xUnit, 285 tests) is the source of
truth for the algorithm; it exercises the layout invariants, converter
round-trips, full pair matrix, and HTTP boundary tests.

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
