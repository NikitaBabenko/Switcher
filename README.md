# VibeNest Switcher

🌐 Live: <https://vibenest.net> · 🤖 Bot: <https://t.me/SynthCabalBot>

Fixes text typed in the wrong keyboard layout.

The shipped product is the **Chrome extension** at [`extension/`](extension/). It runs **fully offline** — the layout-detection engine and 9 trigram language models are bundled inside the extension; no text ever leaves the browser. See [`extension/README.md`](extension/README.md) and [`extension/PRIVACY.md`](extension/PRIVACY.md).

The repo also contains a backend (ASP.NET Core API + Telegram bot) and a web client (React + Vite, doubles as Telegram Mini App). Both are **kept for development and reference** — the web client and TMA reuse the same offline detector via a Vite alias, and the backend powers the Telegram bot when you choose to host it. There is no Docker recipe; run things directly on your machine.

The algorithm is LLM-free: char-by-char transposition through layout tables + a char-trigram language model that picks the direction.

## Layout

```
src/Switcher.Core/      engine (Layout, LayoutConverter, LanguageModel, LayoutDetector, LayoutRegistry)
  Layouts/*.json        layout tables (46 chars normal + shift each)
  LanguageModels/*.txt  wordlists used to train the trigram models
src/Switcher.Api/       REST API + Telegram bot (optional, dev-only deploy)
src/Switcher.Tests/     xUnit
web/                    React + Vite (Web + Telegram Mini App; uses the offline detector)
extension/              Chrome MV3 (background, content, popup, options) — primary product
```

The data files in `src/Switcher.Core/Layouts/` and `src/Switcher.Core/LanguageModels/` are the single source of truth; the extension's bundled trigram model (`extension/lib/data.js`) is regenerated from them.

## Stack

- **Extension:** Chrome MV3, plain JS, fully offline detector. Source: [`extension/`](extension/).
- **Web/TMA:** React 18 + Vite + TypeScript, also offline (imports the same detector via Vite alias). Source: [`web/`](web/).
- **Backend (optional):** ASP.NET Core 10 minimal API + Telegram bot in webhook mode. PostgreSQL for Telegram user settings (in-memory in dev). Source: [`src/`](src/).

## Running locally

### Extension (the main product)

1. Open `chrome://extensions/` → enable Developer mode.
2. **Load unpacked** → pick the `extension/` folder.
3. (Optional) Right-click the icon → Options → "Allow remote API fallback" if you want to point at your own deployed backend for non-bundled languages.

To regenerate the bundled trigram model from the wordlists:

```
node extension/lib/build-models.mjs   # writes extension/lib/data.js
node --test extension/lib/detector.test.mjs extension/lib/config.test.mjs
```

To package the extension into a Chrome Web Store-ready zip:

```
cd extension
npm test            # 29 Node tests
npm run package     # writes extension/dist/vibenest-switcher-<version>.zip
```

See [`extension/README.md`](extension/README.md#publishing-to-the-chrome-web-store) for the publishing checklist.

### Web client (dev)

```
cd web
npm install
npm run dev
# http://localhost:5173 — runs the Web/TMA UI on the offline detector;
# /api requests are proxied to http://localhost:5050 if you also run the API.
```

### Backend (optional, dev / Telegram bot)

The backend is only needed if you want to (a) host the Telegram bot, (b) host the website with persistent TMA settings, or (c) run the deprecated `/api/convert` endpoint. The Chrome extension does **not** require it.

```
dotnet test src/Switcher.Tests
dotnet run --project src/Switcher.Api
# listens on http://localhost:5050 by default (or ASPNETCORE_URLS)
```

Without `ConnectionStrings:Default` the API uses EF Core In-Memory — TMA user settings are not persisted across restarts. To use PostgreSQL pass:

```
ConnectionStrings__Default=Host=localhost;Database=switcher;Username=switcher;Password=switcher
```

## Telegram bot

Pass via env to `dotnet run`:
- `BOT_TOKEN` — token from BotFather.
- `BOT_WEBHOOK_BASE_URL` — public HTTPS address (Telegram requires TLS), e.g. `https://switcher.example.com`.
- `BOT_WEBHOOK_SECRET` — random string used in the URL and in the `secret_token` header.
- `BOT_APP_URL` — TMA URL (same domain, usually the web root).

On startup the API calls `setWebhook` against `<BOT_WEBHOOK_BASE_URL>/api/bot/webhook/<secret>`. For local debugging use `ngrok http 5050`.

Bot commands:
- `/start` — greeting + TMA button.
- `/languages` — list of selected and available languages.
- `/add <code>`, `/remove <code>` — manage the list.
- `/app` — button to open the TMA.
- Any text in a private chat — auto-converted.
- Inline: `@bot text` — single-result preview.

## Supported languages

`en, ru, uk, be, de, fr, el, he, tr`. Each language ships top-3000 words: 8 of them come from [hermitdave/FrequencyWords](https://github.com/hermitdave/FrequencyWords) (frequency-sorted on OpenSubtitles 2018), `be` is taken from the LibreOffice dictionary [be-official.dic](https://github.com/LibreOffice/dictionaries/tree/master/be_BY).

Adding a new language is two files:
1. `src/Switcher.Core/Layouts/<code>.json` — `id`, `name`, `language`, `normal` (46 chars), `shift` (46 chars).
2. `src/Switcher.Core/LanguageModels/<code>.txt` — a wordlist of common words (one per line).

After adding, regenerate the extension bundle: `node extension/lib/build-models.mjs`.

The scoring alphabet is computed automatically from the layout characters.

## Caps Lock heuristic

The detector tries not just every layout, but also the case-inverted variant (so input that looks like `hELLO` — a single lowercase head followed by uppercase — gets flipped to `Hello`). When "as typed" and "case-inverted" tie on score, the variant with the more natural case pattern wins — Title-case or all-lower beat "1 lower + N upper" (the Caps Lock signature). Intentional ALL CAPS is not flipped, since that input has no mixed case to begin with.

## Migrations (backend, optional)

The DB schema is managed via EF Core migrations under `src/Switcher.Api/Persistence/Migrations`. On startup with a relational provider the API calls `MigrateAsync`; in-memory dev mode uses `EnsureCreated`.

Create a new migration:
```
dotnet ef migrations add <Name> --project src/Switcher.Api --startup-project src/Switcher.Api --output-dir Persistence/Migrations
```
The design-time `AppDbContextFactory` reads `ConnectionStrings__Default` from env, falling back to `localhost:5432`.

Apply locally:
```
dotnet ef database update --project src/Switcher.Api --startup-project src/Switcher.Api
```

## Tests

```
dotnet test                                                            # 285 backend tests
node --test extension/lib/detector.test.mjs extension/lib/config.test.mjs   # 29 frontend tests
```

The C# suite covers layout invariants (4×9), converter round-trips on the top-10 words per language, the full detector pair matrix, edge cases (punctuation, override, empty input, unknown language, Caps Lock), and WebApplicationFactory tests for `/api/convert` and `/api/languages`. The Node suite covers detector parity (matching outputs to the C# implementation on the same inputs) and host-policy logic.
