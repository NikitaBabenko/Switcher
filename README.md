# VibeNest Switcher

🌐 Live: <https://vibenest.net> · 🤖 Bot: <https://t.me/SynthCabalBot>

Fixes text typed in the wrong keyboard layout. Available as:

- **Website** — open it, paste, get the fixed text. Settings live in localStorage.
- **Telegram Mini App + bot** — in-chat conversion, inline mode (`@bot text`), commands for languages, button to open the TMA.
- **Chrome extension (MV3)** — select text on any page, press `Ctrl+Shift+L` (or use the context menu) — text is replaced in place. Runs **fully offline** by default: the detector + 9 trigram models are bundled into the extension, no data leaves the browser.

The Web and TMA clients hit the REST API; the Chrome extension uses an in-process port of the same engine and only falls back to the API if the user explicitly opts in. The algorithm is LLM-free: char-by-char transposition through layout tables + a char-trigram language model that picks the direction.

## Stack

- Backend: ASP.NET Core 10 (minimal API + Telegram bot in webhook mode).
- DB: PostgreSQL (only settings of authenticated Telegram users).
- Web/TMA: React 18 + Vite + TypeScript.
- Extension: Chrome MV3, plain JS.
- Deploy: Docker Compose.

## Layout

```
src/Switcher.Core/      engine (Layout, LayoutConverter, LanguageModel, LayoutDetector, LayoutRegistry)
  Layouts/*.json        layout tables (46 chars normal + shift each)
  LanguageModels/*.txt  wordlists used to train the trigram models
src/Switcher.Api/       REST API + Telegram bot
src/Switcher.Tests/     xUnit
web/                    React + Vite (shared by Web and TMA)
extension/              Chrome MV3 (background, content, popup, options)
docker/                 Dockerfiles + nginx.conf
docker-compose.yml
```

## Running locally

### Backend (without Docker)
```
dotnet test src/Switcher.Tests
dotnet run --project src/Switcher.Api
# listens on http://localhost:5050 by default (or ASPNETCORE_URLS)
```

Without `ConnectionStrings:Default` the API uses EF Core In-Memory — TMA user settings are not persisted across restarts. To use PostgreSQL pass:

```
ConnectionStrings__Default=Host=localhost;Database=switcher;Username=switcher;Password=switcher
```

### Web
```
cd web
npm install
npm run dev
# http://localhost:5173, /api proxied to http://localhost:5050
```

### Extension
1. Open `chrome://extensions/`.
2. Enable Developer mode.
3. Load unpacked → pick the `extension/` folder.
4. (Optional) Open extension settings to enable the API fallback if you want extra languages or remote inference.

The bundled offline detector covers all 9 supported languages. To regenerate the bundle from updated wordlists:

```
node extension/lib/build-models.mjs   # writes extension/lib/data.js
node --test extension/lib/detector.test.mjs
```

### Compose
```
docker compose up --build
# Web: http://localhost:8080
# API: http://localhost:8080/api/* (via nginx)
```

## Telegram

Pass via env:
- `BOT_TOKEN` — token from BotFather.
- `BOT_WEBHOOK_BASE_URL` — public HTTPS address (Telegram requires TLS), e.g. `https://switcher.example.com`.
- `BOT_WEBHOOK_SECRET` — random string used in the URL and in the `secret_token` header.
- `BOT_APP_URL` — TMA URL (same domain, usually the web root).

On startup the API calls `setWebhook` against `<BOT_WEBHOOK_BASE_URL>/api/bot/webhook/<secret>`. For local debugging use `ngrok http 8080`.

Bot commands:
- `/start` — greeting + TMA button.
- `/languages` — list of selected and available languages.
- `/add <code>`, `/remove <code>` — manage the list.
- `/app` — button to open the TMA.
- Any text in a private chat — auto-converted.
- Inline: `@bot text` — single-result preview.

## Supported languages (MVP)

`en, ru, uk, be, de, fr, el, he, tr`. Each language ships top-3000 words: 8 of them come from [hermitdave/FrequencyWords](https://github.com/hermitdave/FrequencyWords) (frequency-sorted on OpenSubtitles 2018), `be` is taken from the LibreOffice dictionary [be-official.dic](https://github.com/LibreOffice/dictionaries/tree/master/be_BY).

Adding a new language is two files:
1. `src/Switcher.Core/Layouts/<code>.json` — `id`, `name`, `language`, `normal` (46 chars), `shift` (46 chars).
2. `src/Switcher.Core/LanguageModels/<code>.txt` — a wordlist of common words (one per line).

The scoring alphabet is computed automatically from the layout characters.

## Caps Lock heuristic

The detector tries not just every layout, but also the case-inverted variant (so input that looks like `hELLO` — a single lowercase head followed by uppercase — gets flipped to `Hello`). When "as typed" and "case-inverted" tie on score, the variant with the more natural case pattern wins — Title-case or all-lower beat "1 lower + N upper" (the Caps Lock signature). Intentional ALL CAPS is not flipped, since that input has no mixed case to begin with.

## Migrations

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
dotnet test
```

285 unit and integration tests: layout invariants (4×9), converter round-trip on the top-10 words per language, matrix detector across every pair, edge cases (punctuation, override, empty input, unknown language, Caps Lock), and WebApplicationFactory tests for `/api/convert` (200/413/400) and `/api/languages`. The diagnostic `ScoreProbe` is marked `Skip`.
