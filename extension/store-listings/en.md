# Detailed description — English

Type **`ghbdtn`** when you meant **`привет`**? Press **Ctrl+Shift+L** and the gibberish becomes the right text — without retyping, without leaving the field, and without sending a single character to a server.

## Why VibeNest Switcher is different

- **100% open source** — full source on GitHub: https://github.com/NikitaBabenko/Switcher
- **Fully offline by default** — no telemetry, no analytics, no cloud calls; the language model is bundled into the extension (~270 KB)
- **No account, no sign-in, no payment** — install and use
- **12 languages out of the box** — most layout-fix extensions cover one or two
- **Modern Manifest V3** — minimal permissions, audited and ready for Chrome's 2025 policy
- **Cross-browser ready** — works in Chrome and Chromium-based browsers; Edge & Firefox ports on roadmap

## Familiar feel for Punto users

If you've used Punto Switcher on Windows, this is the same idea — but inside your browser, open source, and without any text leaving your device. Works on every text field on the open web, not just chat boxes.

## Features

- **Keyboard shortcut** (Ctrl+Shift+L) and toolbar popup button to fix the focused field instantly
- **Paste-and-fix** mode — paste mistyped text into the popup, get the corrected version
- **Right-click context menu** when text is selected
- **Per-page Undo** — reverts the last fix on the current page in one click
- **Site adapters** for Twitter/X, Facebook, Messenger, VK, Instagram, Telegram Web, WhatsApp Web, Discord, Slack, Reddit, LinkedIn, Twitch, Mastodon, plus a generic adapter for everything else
- **Site policy** — block specific hosts (e.g. your bank), or limit the extension to a whitelist
- **Smart language defaults** — first install picks your typing languages from the browser locale; you can change them anytime

## How it works

The detection engine transposes each character through every layout pair you have enabled, then a char-trigram language model trained on common-word lists scores both directions — keeping whichever comes out as natural-looking text. Caps-Lock and case-naturalness heuristics catch the awkward edge cases. Everything runs in your browser.

## Who it's for

- Bilingual writers who alternate between English and another script several times per day
- Translators who flip between source and target languages mid-paragraph
- Developers and IT staff working in mixed-language environments
- Help-desk teams who'd rather not send a colleague's email to "Уважаемые коллеги, ifkjvtt..."

## Privacy

By default the extension is offline-only. The bundled detector runs in your browser; no text or metadata is sent anywhere. Permissions are minimal and each one is justified in the privacy policy: https://github.com/NikitaBabenko/Switcher/blob/main/extension/PRIVACY.md

There is an optional remote API fallback (off by default) that you can enable in Settings if you want to point at your own conversion endpoint. The default install never reaches the network.

## Supported languages

English, Русский, Українська, Беларуская, Deutsch, Français, Ελληνικά, עברית, Türkçe, Polski, Español, 한국어.

Need another? Open an issue on GitHub or write to info@vibenest.net — adding a layout + wordlist takes a few hours.

## Source code & contact

- GitHub: https://github.com/NikitaBabenko/Switcher
- Email for suggestions, bug reports, and new-language requests: **info@vibenest.net**

## Disclaimer

Punto Switcher is a trademark of its respective owner. VibeNest Switcher is an independent open-source project, not affiliated with or endorsed by Yandex.
