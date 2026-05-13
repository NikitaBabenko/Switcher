# VibeNest Switcher: Detailed description (English)

Type `ghbdtn` when you meant `привет`. Press `Ctrl+Shift+L`. The gibberish becomes the right text without retyping, without leaving the field, and without sending a single character to a server.

VibeNest Switcher is a Chrome extension that catches text typed in the wrong keyboard layout and rewrites it correctly in a single keystroke. It runs fully offline by default. The source is on GitHub. It ships with 12 keyboard layouts (English, Russian, Ukrainian, Belarusian, German, French, Greek, Hebrew, Turkish, Polish, Spanish, Korean) and a matching set of 12 UI translations.

============================================================

WHY VIBENEST SWITCHER IS DIFFERENT

100% open source. Every line of code that runs against your text is public on GitHub: https://github.com/NikitaBabenko/Switcher. Run the tests locally, build from source, verify in your own browser.

Fully offline by default. The language model is bundled inside the extension package, about 270 KB. No telemetry, no analytics, no cloud calls, no third-party scripts. The conversion never leaves your device.

No account, no sign-in, no payment, no ads. Install and use.

12 keyboard layouts out of the box. Most layout-fix extensions cover one or two pairs (Russian/English). VibeNest handles any pair you enable.

Modern Manifest V3 build. Audited minimum permissions, forward-compatible with Chrome's 2025 policy. No migration work on your side.

Cross-browser ready. Works in Chrome and every Chromium-based browser (Edge, Brave, Opera, Vivaldi). Edge and Firefox standalone ports are on the roadmap.

============================================================

WHAT IT DOES

Keyboard shortcut (Ctrl+Shift+L) and toolbar popup. The shortcut converts the active text field in place. The popup gives you a two-pane view with the original and corrected text, useful for read-only fields or when you want to inspect the conversion before applying it.

Paste-and-fix mode. Paste mistyped text into the popup, see the corrected version, copy it out with one click. Works for text you've already pasted into the address bar, an export view, or any read-only context.

Right-click context menu. With text selected on the page, right-click and choose "Fix layout" without touching the keyboard.

Auto-correct as you type. Opt-in, off by default. When enabled, the extension watches what you type and corrects obvious wrong-layout words after the space. Press Backspace immediately to reject any auto-correction. Fields that look like passwords (input type=password, autocomplete=current-password) and OTP / card-number fields are hard-excluded from auto-correction by design.

Per-page Undo. The popup keeps a one-step undo for the last fix on the current page; useful when the conversion went the wrong way (Cyrillic vs Latin transliteration of a proper noun, for example).

Site adapters. Pre-built handlers for sites with non-standard text input (contenteditable wrappers, React-managed inputs, frame-isolated composers): Twitter/X, Facebook, Messenger, VK, Instagram, Telegram Web, WhatsApp Web, Discord, Slack, Reddit, LinkedIn, Twitch, Mastodon. A generic adapter covers every other site.

Site policy. Block specific hosts (your bank, your intranet, your password manager) or restrict the extension to a whitelist of hosts you trust. Per-host policies persist across sessions.

Smart language defaults. The first time you open the extension, it reads your browser locale and pre-selects the most likely typing languages. You change this anytime in Options. The detection runs only against the languages you have enabled, so results stay fast and accurate.

12 keyboard layouts out of the box. English (US QWERTY), Russian (ЙЦУКЕН), Ukrainian, Belarusian, German (QWERTZ), French (AZERTY), Greek, Hebrew, Turkish (Q-keyboard), Polish (214), Spanish (QWERTY), Korean (Dubeolsik / 두벌식).

12 UI translations. Popup and Options page are localized to en, ru, uk, be, de, fr, el, he, tr, pl, es, ko. The popup follows the right-to-left direction for Hebrew.

============================================================

HOW IT WORKS

The detection engine transposes each character through every layout pair you have enabled, then a character-trigram language model scores both directions. The model is trained on the top 3000 most-frequent words for each language. The direction that scores higher (looks more like natural text) is the one applied to the field.

A Caps-Lock heuristic and a "case-naturalness" tiebreaker handle awkward edge cases: `hELLO` becomes `Hello`; intentional `ALL CAPS` stays intact; mixed-case mid-word like `JavaScript` is preserved.

The algorithm is deliberately LLM-free. It's a transposition table plus a small statistical scorer. That keeps the bundled language model around 270 KB and the conversion sub-millisecond, which is what you need for inline use in an active text input. Because the model is bundled and frozen, every install behaves identically; there is no silent server-side retraining behind your back.

Korean is the most interesting case in the engine. Every Hangul syllable on screen is reversibly decomposed into its compatibility-jamo keystroke sequence, so the same transpose-then-score algorithm works there too. After scoring, the result is recomposed back into Hangul syllables.

============================================================

WHO IT'S FOR

- Bilingual writers who alternate between English and another script several times per day.
- Translators who flip between source and target languages mid-paragraph.
- Developers and IT staff working in mixed-language environments (commit messages, ticket comments, code reviews across cultures).
- Help-desk teams who'd rather not send a colleague's email to "Уважаемые коллеги, ifkjvtt..."
- Language students who copy text between dictionary, notes, and a chat with a tutor.
- Anyone with a multi-script workflow (Cyrillic + Latin, Greek + Latin, Hebrew + Latin, Hangul + Latin).

============================================================

PRIVACY

By default the extension is offline-only. The bundled detector runs in your browser. No text, no metadata, no events are sent anywhere. There is no analytics SDK, no telemetry, no remote logging, and no third-party script in the extension. The package is small enough to read end-to-end on GitHub.

Permissions and their justifications are spelled out line-by-line in the privacy policy: https://github.com/NikitaBabenko/Switcher/blob/main/extension/PRIVACY.md

There is an optional remote-API fallback in Options that is off by default, with an empty URL field. If you never enable it, the extension never makes a network request related to text conversion. The fallback exists for users who run their own conversion endpoint and want the popup to point at it; it is not a default and never reaches a third-party service.

============================================================

FAQ

Q: How do I fix text typed in the wrong layout?
A: Place the cursor in the text field, press Ctrl+Shift+L. The extension detects the layout pair, transposes the characters, and rewrites the field in place. Works in Twitter, Slack, Discord, Gmail, Notion, Reddit, LinkedIn, WhatsApp Web, Telegram Web, and any other text input on the open web.

Q: How do I switch between Russian and English keyboard input?
A: VibeNest Switcher does not replace your OS layout-switch shortcut. Keep using whatever combination your OS gives you to flip the active layout. The extension fixes text you have already typed under the wrong layout, that is the part the OS does not handle.

Q: Is this a multilingual keyboard tool?
A: Yes. 12 layouts, detects and converts between any pair you enable.

Q: Does it transliterate Cyrillic to Latin?
A: No. This is layout-fix, not phonetic typing. Phonetic input tools that let you type Russian without a Russian keyboard are a different category.

Q: Does it work offline?
A: Yes. Fully offline by default. The trigram model is inside the extension package. No text or metadata is sent anywhere.

Q: What permissions does it need and why?
A: Minimum necessary for browser-wide text rewriting: activeTab, scripting, storage, contextMenus. Each one is justified in PRIVACY.md.

Q: How do I enable auto-correct as I type?
A: Open the extension popup, click the gear icon, toggle Auto-correct on. Use the Backspace key to reject any auto-correction immediately after it happens.

Q: Does it work in Edge, Brave, Opera?
A: Yes, every Chromium-based browser. Edge picks up MV3 builds straight from the Chrome Web Store.

Q: Will you add layout X (Hindi, Italian, Czech)?
A: Yes, request it. Adding one layout is two files (46-character table plus top-3000 wordlist) plus model rebuild; we ship them as fast as we can verify them.

============================================================

SUPPORTED LANGUAGES

English, Русский, Українська, Беларуская, Deutsch, Français, Ελληνικά, עברית, Türkçe, Polski, Español, 한국어.

Need another? Open an issue on GitHub or write to info@vibenest.net.

============================================================

WHAT'S NEW

Version 1.0.1 (May 13, 2026)
- Cleaned em-dashes from UI strings and landing copy for a consistent typographic style.

Version 1.0.0 (May 12, 2026)
- Stable release. Hidden remote-API fallback in Settings is fully opt-in with an empty URL field; the default install never reaches the network.
- Refreshed privacy text in Settings to reflect the offline-first posture.
- Korean Hangul composition / decomposition is the recommended path for 한영 transposition.

Earlier releases added the Korean, Polish, and Spanish layouts (v0.3.0), site adapters for Twitch / Mastodon, and the per-page undo behavior.

============================================================

SOURCE CODE & CONTACT

- GitHub: https://github.com/NikitaBabenko/Switcher
- Privacy policy: https://github.com/NikitaBabenko/Switcher/blob/main/extension/PRIVACY.md
- Email for suggestions, bug reports, and new-language requests: info@vibenest.net

