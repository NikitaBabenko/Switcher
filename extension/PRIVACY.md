# Privacy Policy — VibeNest Switcher (Chrome Extension)

_Last updated: 2026-05-14_

## Short version

The extension fixes text typed in the wrong keyboard layout. By default, **no
text leaves your browser**. Detection runs entirely on your device using a
language model bundled inside the extension. We do not collect, store, or
transmit any data, and there are no third-party analytics, telemetry, or
advertising scripts.

## Who runs this

The extension is developed by **Nikita Babenko**, operating as **VibeNest**.
There is no third-party data processor — the developer is the sole party.

## What the extension does with your text

- Reads selected text and the contents of the focused text field on the active
  tab when you trigger a conversion (toolbar button, `Ctrl+Shift+L`, or the
  right-click context menu).
- Runs the layout-detection algorithm **inside your browser** against a
  bundled char-trigram language model (12 languages: English, Russian,
  Ukrainian, Belarusian, German, French, Greek, Hebrew, Turkish, Polish,
  Spanish, Korean).
- Writes the corrected text back into the same field, or to the clipboard if
  the field can't be modified directly.

That's the entire data flow. The text never leaves your device.

## Optional remote API fallback

The extension carries a code path for a remote conversion API fallback that
the user (or someone running a self-hosted endpoint) could opt into. As of
v1.0 this path is **disabled and hidden in the UI**: the toggle and the URL
field in Options are wrapped in `hidden`, the toggle defaults to off, and the
URL field defaults to empty. A default install therefore never makes any
network request related to text conversion — the bundled offline detector
covers all 12 languages on its own. The capability remains in the source so
self-hosters can re-enable it for their own builds; in shipped Web Store
installs there is no in-app way to turn it on.

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
| `activeTab` | Read and modify the field you're typing in on the **current tab**, only after you take an explicit action — clicking the toolbar icon, pressing `Ctrl+Shift+L`, or clicking the context menu item. No background access; no access to other tabs. |
| `scripting` | Inject the extension's content scripts into the current tab on demand (once the `activeTab` gesture grants access) and write to the clipboard as a fallback when in-place replacement isn't possible (e.g. read-only fields). |
| `contextMenus` | Add the right-click "Switcher: switch layout" item. |
| `storage` | Save your settings (see above). |
| `notifications` | Show a small notification when a conversion couldn't be applied in place and was copied to the clipboard. |
| `clipboardWrite` | Same as above — clipboard fallback. |
| `sidePanel` | Open the extension's side panel UI when you click the toolbar icon. The panel shows the per-site override and a link to the full settings. |

The extension does not request `<read>` permissions on your browsing history,
bookmarks, downloads, identity, network, or any other Chrome API beyond the
ones above.

## What we do NOT do

- No analytics, no telemetry, no remote logging.
- No tracking pixels, no advertising integrations.
- No third-party scripts of any kind. The extension ships only its own code.
- No collection of personal data, browsing history, or content you type.
- No background access to your tabs. The extension is dormant until you take
  an explicit action (toolbar icon, `Ctrl+Shift+L`, or context menu); only
  then does it inject its scripts, and only on the current tab.
- We do not sell, transfer, or use any data for purposes outside the stated
  functionality of correcting layout-mistyped text. There are no advertising
  profiles, no resale to data brokers, no use of any data for credit-scoring,
  and no human reviewers reading anything.

## Open source

The extension is open source. You can audit the code, including this exact
data-flow path, at:

https://github.com/NikitaBabenko/Switcher (folder `extension/`)

## Contact

For privacy questions, write to **info@vibenest.net**. For non-public concerns
you can also reach the developer directly at nikita_babenko@fastmail.com.
Public bug reports are best filed as GitHub issues at the repository above.
