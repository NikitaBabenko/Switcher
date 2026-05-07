# Store listings (per-locale long descriptions)

This folder contains the **long-form description** for each locale we plan to publish into the Chrome Web Store.

These files are NOT shipped in the extension zip (`tools/package.mjs` excludes the folder). They are intended for **manual paste** into the Web Store dashboard, which has a per-locale tab for the long description (the manifest's `__MSG_appShortDescription__` only covers the 132-char short description).

## Files

- `en.md` — master, English (US/UK/CA/AU/IN markets)
- `ru.md` — Russian
- `uk.md` — Ukrainian
- `de.md` — German
- `fr.md` — French

`be`, `el`, `he`, `tr` are intentionally not included — those locales have lower search volume; cover the manifest-level `_locales/<code>/messages.json` first and add long descriptions here later if traction warrants.

## Per-locale workflow

1. Open <https://chrome.google.com/webstore/devconsole>.
2. Navigate to the extension → **Store listing** tab.
3. Use the locale selector (top of page) to switch.
4. Paste the matching `<locale>.md` content into the **Detailed description** field.
5. Save.

## Trademark hygiene

Each file mentions "Punto Switcher" sparingly (≤3 times) under nominative-fair-use framing ("open-source alternative to") and ends with a footer disclaimer disclaiming any affiliation with Yandex or the Punto Switcher product. Do not exceed those mentions or use Yandex/Punto logos or color schemes anywhere in the listing.
