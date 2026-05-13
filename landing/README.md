# Landing pages (vibenest.net/switcher)

Marketing landing pages for the **VibeNest Switcher** Chrome extension, authored in markdown and consumed by whichever static site generator powers `vibenest.net` (currently external to this repo).

These files are NOT shipped inside the extension zip. `extension/tools/package.mjs` only packages files inside `extension/`, and this directory lives at the repo root. They are distinct from `extension/store-listings/<locale>.md`, which are the short Chrome Web Store dashboard descriptions originally produced when only en/ru/uk/de/fr coverage existed.

## Files

### Landing pages (`landing/<locale>.md`)

Twelve standalone SEO landing pages, one per supported locale:

- `en.md`: English (`vibenest.net/switcher`)
- `ru.md`: Russian (`vibenest.net/ru/switcher`)
- `uk.md`: Ukrainian
- `be.md`: Belarusian
- `de.md`: German
- `fr.md`: French
- `el.md`: Greek
- `he.md`: Hebrew (RTL, the SSG must honor `dir="rtl"` from frontmatter)
- `tr.md`: Turkish
- `pl.md`: Polish
- `es.md`: Spanish
- `ko.md`: Korean

Each page targets 1,800-2,500 words for Latin scripts (Hangul / RTL scripts have lower character-count targets, see verification below).

### Long-form store descriptions (`landing/store/<locale>.md`)

Twelve long-form Chrome Web Store dashboard descriptions, one per locale. Derived from the corresponding landing page but cast for the dashboard audience (no YAML frontmatter, no schema markup, no FAQ accordions, flat-text style). Each file is capped at 16,000 characters (Chrome Web Store dashboard limit).

These supersede the short `extension/store-listings/<locale>.md` versions (which remain in the repo but are not actively maintained for the new long form).

## Content rules (every landing page must hold these)

| Rule | Why | Reference |
|---|---|---|
| **Primary keyword** in H1, H2, first 100 words, FAQ. 4-6 times total | Head-term authority signal | `extension/seo-research.md` per-locale tables |
| **No "Russian" in EN H1** | User policy: no Russian-led EN positioning | `extension/seo-research.md` |
| **Punto Switcher mentioned exactly 3×** per page (comparison header + FAQ Q + footer) | Trademark / nominative-fair-use cap | `extension/seo-research.md` |
| **No Punto colors (red circle), no Yandex logo** | Trademark hygiene | `extension/seo-research.md` |
| **Mandatory footer disclaimer** verbatim per locale | Legal | `extension/seo-research.md` |
| **1,800-2,500 words** per page (Latin scripts) | Below 1,500 lacks SEO authority for a head term; above 3,000 hurts engagement | n/a |
| **3 CTAs** to Chrome Web Store: hero, after comparison, after FAQ | Conversion pattern | n/a |
| **YAML frontmatter** with `hreflang` for all 12 locales, `schema`, `canonical` | SSG-agnostic; lifted into `<head>` and JSON-LD by the generator | n/a |
| **No em-dashes** (`—`), no AI-tell phrases | Style policy per v1.0.1 release | `CHANGELOG.md` v1.0.1 |

## Verification (manual; no automated suite)

After editing any landing page or store description, run from repo root:

```bash
# Punto mention count per landing (target: exactly 3)
for f in landing/[a-z]*.md; do
  echo "$f: $(grep -ci 'punto switcher' "$f")"
done

# CTA count per landing (target: exactly 3)
for f in landing/[a-z]*.md; do
  echo "$f: $(grep -c 'chrome.google.com/webstore' "$f")"
done

# Em-dash count (target: 0 everywhere)
for f in landing/*.md landing/store/*.md; do
  c=$(grep -c '—' "$f")
  [ "$c" -gt 0 ] && echo "$f: $c em-dashes"
done

# Word count for Latin-script landings (target: 1,800-2,500)
wc -w landing/en.md landing/de.md landing/fr.md landing/es.md landing/pl.md landing/tr.md

# Char count for store descriptions (target: under 16,000)
# Note: wc -c gives bytes; for non-Latin scripts use a codepoint-aware tool.
for f in landing/store/*.md; do
  echo "$f: $(wc -c < "$f") bytes"
done
```

For PowerShell (accurate codepoint count for non-Latin scripts):

```powershell
Get-ChildItem 'landing/store/*.md' | ForEach-Object {
  $chars = (Get-Content $_.FullName -Raw -Encoding UTF8).Length
  '{0}: {1} chars' -f $_.Name, $chars
}
```

## Refresh cadence

Mirror [`extension/seo-research.md`](../extension/seo-research.md):

- **Quarterly**: re-pull keyword volumes, refresh comparison-table competitors if anyone shipped a new feature, refresh `last_updated` frontmatter.
- **After Chrome Web Store algorithm change**: re-evaluate keyword placement.
- **After 30 days from publication**: check Google Search Console; if the planned primary keyword isn't ranking, examine which variant *is* winning impressions and adjust H1.
- **After every significant extension feature release**: update the Features section, comparison table, and the live-language list across all 12 landings AND store descriptions.

## Web Store URL

The CTA links use `https://chrome.google.com/webstore/detail/vibenest-switcher/<id>` as a placeholder. Replace `<id>` with the real Web Store extension ID after publication. Search for `TODO: Web Store ID` across `landing/*.md` to find every occurrence.
