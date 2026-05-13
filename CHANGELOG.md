# Changelog

All notable changes to **VibeNest Switcher** are tracked here. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); the project uses [semantic versioning](https://semver.org/spec/v2.0.0.html).

`Unreleased` is whatever has landed on `main` but isn't packaged for the Chrome Web Store yet. Bump `extension/manifest.json` (and `extension/package.json`) and move the section under a dated heading when shipping.

## [Unreleased]

## [1.0.1] — 2026-05-13

### Changed
- **Removed em-dash punctuation from every user-facing string in all 12 locales.** `extension/_locales/{en,ru,be,uk,de,fr,es,el,he,ko,pl,tr}/messages.json` previously used " — " in the extension name (Web Store / toolbar / context menu), the options-page title and headings, list-item hints, and the privacy / first-run / contact paragraphs — a punctuation pattern that reads as machine-generated and undermined a product whose pitch is open-source verifiability. 98 em-dashes total, replaced contextually: titles and label-style intros got a colon, sentence-mid parentheticals were rewritten as commas or split into two sentences. Same pass applied to the landing manifestos at `landing/{en,ru}.md` (62 em-dashes), which also had the auxiliary AI-rhythm tells the locales did not: triple parallel structures (`no select-all, no copy-paste, no retyping` / `No remote model. No API round-trip. No latency.` / `без выделить-удалить-перепечатать, без выхода из поля, без отправки`), a four-way `whether…whether…whether…` clause in the EN comparison intro, and a `not just X, it's Y` framing in the privacy answer — all rewritten into plain prose. No semantic changes; landing word counts stay inside the 1,800–2,500 SEO band; Punto Switcher mentions and CTA counts unchanged.

## [1.0.0] — 2026-05-12

### Changed
- **Hid remote-API fallback controls in settings; refreshed stale privacy text.** The "Allow remote API fallback" checkbox and "API endpoint" field in `extension/options.html` are now wrapped in `<div hidden>` — all 12 bundled languages already work fully offline, the API path is dead code in practice, and the controls were adding noise to the Chrome Web Store Privacy review. DOM bindings in `options.js` still resolve, so re-enabling is a one-attribute revert. Same pass synced the hardcoded English fallback for `options_privacyBody`: was "Bundled languages: 9 (… Turkish)" (leftover from before pl/es/ko), now reads "12 (… Polish, Spanish, Korean)" — so the brief flash before `chrome.i18n` hydrates also says "12".
- **Stripped keyboard-layout marker from settings language labels.** The settings page rendered each language as e.g. "Russian (JCUKEN) (ru)" because the layout JSONs ship a parenthesised layout name in their `name` field (JCUKEN/QWERTY/QWERTZ/AZERTY/214/Q/두벌식). For users who don't recognise these standard layout codes the inner parens read as noise on top of the locale code, so `extension/options.js` now strips the trailing `(…)` segment at render time. Source strings in `data/layouts/*.json` stay untouched — re-enabling the marker is a one-line revert.

### Fixed
- **In-place replacement on Twitter/X (and other framework-controlled rich editors) — right-click and Ctrl+Shift+L now actually rewrite the compose box instead of falling back to clipboard or appending at the cursor.** Twitter compose, Reddit posts (DraftJS), Discord (Slate), LinkedIn / Slack (Quill), vk feed (ProseMirror), and Lexical-based editors reconcile DOM mutations against their own model — so the previous `execCommand("insertText")` → raw `range.deleteContents()` / `range.insertNode()` chain in `content/replace.js` either no-ops or gets reverted on the next render, leaving the converted text on the clipboard with a misleading toast. Added `detectFramework(el)` (matches each editor's marker class/attribute) and `replaceViaSyntheticPaste(el, text)` (dispatches a `ClipboardEvent("paste")` with a `DataTransfer` text/plain payload — the editor's own `onPaste` pipeline then applies the change through its normal command path). For whole-field mode (no user selection) the fix also force-fires a synthetic `selectionchange` after `selectAllContentEditable` so the editor syncs its model selection before paste lands; without it the paste was landing at the stale collapsed cursor and just appending. The same paste-first path is wired into the opt-in auto-correct (`content/autocorrect.js`). `focusElement` is now guarded on `findActiveEditable() !== el` to avoid collapsing the live selection on already-focused React editors.
- **Neutralised the English popup textarea placeholder.** `_locales/en/messages.json` and the hardcoded HTML fallback in `extension/popup.html` said "Paste cyrillic gibberish here…" — a leftover from when the extension was an ru↔en tool. All 11 other locales already used neutral "wrong layout" phrasing, so a German or Korean user on the English UI was the only one being told the gibberish would be Cyrillic. Now reads "Paste mistyped text here…".
- 17 new tests covering framework detection (Lexical / Slate / DraftJS / ProseMirror / Quill markers), synthetic-paste dispatch shape, the selectionchange-before-paste ordering for whole-mode, and a regression check that plain contenteditable still goes through the `execCommand` path. **276 total, all green.**

## [0.3.0] — 2026-05-09

### Added
- **Polish (214) keyboard layout** — `data/layouts/pl.json` + top-3000 wordlist from [hermitdave/FrequencyWords](https://github.com/hermitdave/FrequencyWords).
- **Spanish (QWERTY) keyboard layout** — `data/layouts/es.json` with ñ on the `;` position, ¡ ¿ on the number row, etc.
- **Korean (Dubeolsik / 두벌식) keyboard layout** — `data/layouts/ko.json` with compatibility jamo on the letter positions.
- **Hangul compose/decompose engine** in `lib/hangul.js`. Composed Hangul syllables are decomposed to keystroke compatibility jamo before transposition (handling compound vowels like ㅗ+ㅏ → ㅘ and compound finals like ㄱ+ㅅ → ㄳ); jamo output is recomposed to Hangul on the display side. The same transpose-then-score algorithm now works for `dkssud` → `안녕` and the reverse.
- `landing/{en,ru}.md` — SEO-optimised markdown landing pages for `vibenest.net/switcher`. Distinct from `extension/store-listings/` (which are pasted into the Chrome Web Store dashboard).
- 33 new tests covering Hangul round-trips, compound jamo, and pl/es/ko transposition. **256 total, all green.**

### Changed
- "9 languages" → "12 languages" across all 12 `_locales/`, the five `store-listings/`, both READMEs, `PRIVACY.md`, and the landing pages.
- `lib/build-models.mjs` now decomposes the Korean wordlist to jamo before training the trigram model so it scores post-transposition output correctly.
- `LanguageModel.score` handles the Korean decompose internally (rather than special-casing in `addCandidates`); transposition with Korean source/target goes through a new `transposeText` helper.

### Fixed
- Misleading "Select some text first…" notification on `chrome://`, `edge://`, the Chrome Web Store, and other privileged pages where Chrome blocks content-script injection. Added `isRestrictedUrl()` helper in `config.js`; the hotkey/context-menu path in `background.js` and the side panel in `popup.js` now bail out early with a new `notification_pageNotSupported` / `popup_pageNotSupported` message, disable the "Decrypt focused field" button, mirror the explanation as a hover tooltip on it, and auto-focus the paste-textarea fallback. The pages still can't be edited in place (Chrome doesn't allow it), but the user finally sees an honest reason instead of being told to do something they already did.
- 4 new tests for `isRestrictedUrl` covering chrome:// / edge:// / about: / view-source: / Chrome Web Store / regular https. **260 total, all green.**

## [0.2.0] — initial Chrome Web Store submission

Snapshot of the codebase prior to pl/es/ko. Documented retroactively from git history.

- 9 keyboard layouts: en, ru, uk, be, de, fr, el, he, tr.
- 12 UI translations (interface localised to en, ru, uk, be, de, fr, el, he, tr, pl, es, ko — Polish, Spanish, and Korean were UI-only at this point; layouts were added in the next iteration).
- Manifest V3, fully offline detection, opt-in remote API fallback.
- Per-site adapters for Twitter/X, Facebook, Messenger, VK, Instagram, Telegram Web, WhatsApp Web, Discord, Slack, Reddit, LinkedIn, Twitch, Mastodon.
- Auto-correct opt-in mode with password / OTP / cc-* field skipping.
- Per-page Undo, site policy (block / allowlist), site override per tab.
- 223 Node tests (detector, config, adapters, autocorrect, replace, content, package, i18n).
