# Landing pages (vibenest.net/switcher)

Marketing landing pages for the **VibeNest Switcher** Chrome extension, authored in markdown and consumed by whichever static site generator powers `vibenest.net` (currently external to this repo).

These files are NOT shipped inside the extension zip — `extension/tools/package.mjs` only packages files inside `extension/`, and this directory lives at the repo root. They are also distinct from `extension/store-listings/<locale>.md`, which are the long-form Chrome Web Store descriptions pasted into the Web Store dashboard.

## Files

- `en.md` — primary landing page, English (`vibenest.net/switcher`)
- `ru.md` — primary landing page, Russian (`vibenest.net/ru/switcher`)

EN and RU are the two highest-value markets per [`extension/seo-research.md`](../extension/seo-research.md). Other locales (uk, de, fr, pl, es, ko, etc.) have Web Store coverage but no landing page yet — add a file here only after install analytics show meaningful organic search volume from that locale.

## Content rules (every page must hold these)

| Rule | Why | Reference |
|---|---|---|
| **Primary keyword** in H1, H2, first 100 words, FAQ — 4-6 times total | Head-term authority signal | `extension/seo-research.md` per-locale tables |
| **No "Russian" in EN H1** | User policy: no Russian-led EN positioning | `extension/seo-research.md:118` |
| **Punto Switcher mentioned ≤3×** per page (comparison header + FAQ Q + footer) | Trademark / nominative-fair-use cap | `extension/seo-research.md:58-61` |
| **No Punto colors (red circle), no Yandex logo** | Trademark hygiene | `extension/seo-research.md:60` |
| **Mandatory footer disclaimer** verbatim per locale | Legal | `extension/seo-research.md:711-722` |
| **1,800-2,500 words** per page | Below 1,500 lacks SEO authority for a head term; above 3,000 hurts engagement | — |
| **3 CTAs** to Chrome Web Store: hero, after comparison, after FAQ | Conversion pattern | — |
| **YAML frontmatter** with `hreflang`, `schema`, `canonical` | SSG-agnostic; lifted into `<head>` and JSON-LD by the generator | — |

## Verification (manual; no automated suite)

After editing either page:

```bash
# Word count
wc -w landing/en.md landing/ru.md             # both 1,800-2,500

# Punto mention count
grep -ci "punto switcher" landing/en.md       # exactly 3
grep -ci "punto switcher" landing/ru.md       # exactly 3

# Primary keyword density (EN)
grep -ci "multilingual keyboard" landing/en.md   # 4-6
# Primary keyword density (RU)
grep -ci "раскладка клавиатуры" landing/ru.md     # 4-6

# No "Russian" in EN H1
head -25 landing/en.md | grep -i "russian"     # empty

# CTA count
grep -c "chrome.google.com/webstore" landing/en.md   # 3
grep -c "chrome.google.com/webstore" landing/ru.md   # 3
```

## Refresh cadence

Mirror [`extension/seo-research.md`](../extension/seo-research.md):

- **Quarterly**: re-pull keyword volumes, refresh comparison-table competitors if anyone shipped a new feature, refresh "Last updated" frontmatter.
- **After Chrome Web Store algorithm change**: re-evaluate keyword placement.
- **After 30 days from publication**: check Google Search Console; if the planned primary keyword isn't ranking, examine which variant *is* winning impressions and adjust H1.
- **After every significant extension feature release**: update the Features section + comparison table + the live-language list.

## Web Store URL

The CTA links use `https://chrome.google.com/webstore/detail/vibenest-switcher/<id>` as a placeholder. **Replace `<id>` with the real Web Store extension ID after publication** — search for `TODO: Web Store ID` across `landing/*.md` to find every occurrence.
