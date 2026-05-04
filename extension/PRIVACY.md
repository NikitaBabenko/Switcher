# Privacy Policy — VibeNest Switcher (Chrome Extension)

_Last updated: 2026-05-04_

## Short version

The extension fixes text typed in the wrong keyboard layout. By default, **no
text leaves your browser**. Detection runs entirely on your device using a
language model bundled inside the extension. We do not collect, store, or
transmit any data, and there are no third-party analytics, telemetry, or
advertising scripts.

## What the extension does with your text

- Reads selected text and the contents of the focused text field on the active
  tab when you trigger a conversion (toolbar button, `Ctrl+Shift+L`, context
  menu item, or — if you opted in — automatic correction after a space).
- Runs the layout-detection algorithm **inside your browser** against a
  bundled char-trigram language model (9 languages: English, Russian,
  Ukrainian, Belarusian, German, French, Greek, Hebrew, Turkish).
- Writes the corrected text back into the same field, or to the clipboard if
  the field can't be modified directly.

That's the entire data flow. The text never leaves your device.

## Optional remote API fallback

You can opt in to a remote conversion API in **Options → Privacy → Allow
remote API fallback**. When enabled and configured with an endpoint URL, the
extension may send the text you ask it to convert to that endpoint over HTTPS.
This setting is **off by default** and the URL field is **empty by default**.
If you do not enable this, no network request related to conversion is ever
made.

## Storage

The extension stores its settings (selected languages, behaviour preferences,
your site policy list) using `chrome.storage.sync` so they roam with your
Chrome profile across devices. We do not have access to this storage; only
your browser does.

A per-tab "site override" preference lives in `chrome.storage.session` and is
cleared when the tab closes (or the browser restarts).

## Permissions and why they exist

| Permission | Why |
|---|---|
| `host_permissions: <all_urls>` + `content_scripts: <all_urls>` | The extension acts on the field you're typing in. It needs to attach to whatever site you visit. |
| `activeTab` | Send the converted text back into the focused field of the current tab. |
| `scripting` | Write to the clipboard as a fallback when in-place replacement isn't possible (e.g. read-only fields). |
| `contextMenus` | Add the right-click "Switcher: switch layout" item. |
| `storage` | Save your settings (see above). |
| `notifications` | Show a small notification when a conversion couldn't be applied in place and was copied to the clipboard. |
| `clipboardWrite` | Same as above — clipboard fallback. |

The extension does not request `<read>` permissions on your browsing history,
bookmarks, downloads, identity, network, or any other Chrome API beyond the
ones above.

## What we do NOT do

- No analytics, no telemetry, no remote logging.
- No tracking pixels, no advertising integrations.
- No third-party scripts of any kind. The extension ships only its own code.
- No collection of personal data, browsing history, or content you type.
- The auto-correct feature, when enabled, **explicitly skips** password
  fields, OTP / one-time-code inputs, and credit-card fields (detected via
  `<input type=password>` and `autocomplete` attributes).

## Open source

The extension is open source. You can audit the code, including this exact
data-flow path, at:

https://github.com/NikitaBabenko/Switcher (folder `extension/`)

## Contact

If you have a privacy question or concern, open an issue at the repository
above.
