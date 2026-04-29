# VibeNest Switcher

🌐 Live: <https://vibenest.net> · 🤖 Bot: <https://t.me/SynthCabalBot>

Чинит текст, набранный в неправильной раскладке. Доступен как:

- **Веб-сайт** — открыл, вставил, получил исправленный текст. Настройки в localStorage.
- **Telegram Mini App + бот** — конвертация в чате, inline-режим (`@bot текст`), команды для языков, кнопка открытия TMA.
- **Chrome-расширение (MV3)** — выделил текст на любой странице, нажал `Ctrl+Shift+L` (или контекстное меню) — текст заменён.

Все клиенты бьют в один REST API. Алгоритм без LLM: char-by-char транспозиция по таблицам раскладок + char-trigram language model для определения направления.

## Стек

- Backend: ASP.NET Core 10 (минимальный API + Telegram-бот в webhook-режиме).
- БД: PostgreSQL (только настройки авторизованных Telegram-пользователей).
- Web/TMA: React 18 + Vite + TypeScript.
- Extension: Chrome MV3, plain JS.
- Деплой: Docker Compose.

## Структура

```
src/Switcher.Core/      движок (Layout, LayoutConverter, LanguageModel, LayoutDetector, LayoutRegistry)
  Layouts/*.json        таблицы раскладок (по 46 символов normal + shift)
  LanguageModels/*.txt  словари для тренировки трёхграмм
src/Switcher.Api/       REST API + Telegram-бот
src/Switcher.Tests/     xUnit
web/                    React + Vite (общий для Web и TMA)
extension/              Chrome MV3 (background, content, popup, options)
docker/                 Dockerfiles + nginx.conf
docker-compose.yml
```

## Локальный запуск

### Бэкенд (без Docker)
```
dotnet test src/Switcher.Tests
dotnet run --project src/Switcher.Api
# по умолчанию слушает http://localhost:5050 (или ASPNETCORE_URLS)
```

Без `ConnectionStrings:Default` API использует EF Core In-Memory — настройки TMA-юзеров не сохраняются между перезапусками. Для PostgreSQL передай переменную:

```
ConnectionStrings__Default=Host=localhost;Database=switcher;Username=switcher;Password=switcher
```

### Веб
```
cd web
npm install
npm run dev
# http://localhost:5173, прокси на /api → http://localhost:5050
```

### Расширение
1. Открой `chrome://extensions/`.
2. Включи Developer mode.
3. Load unpacked → выбери папку `extension/`.
4. Открой настройки расширения (правый клик по иконке → Options) и укажи `apiBase` (по умолчанию http://localhost:5050).

### Compose
```
docker compose up --build
# Web: http://localhost:8080
# API: http://localhost:8080/api/* (через nginx)
```

## Telegram

В env передай:
- `BOT_TOKEN` — токен от BotFather.
- `BOT_WEBHOOK_BASE_URL` — публичный HTTPS-адрес (TG требует TLS), напр. `https://switcher.example.com`.
- `BOT_WEBHOOK_SECRET` — рандомная строка, используется в URL и в заголовке secret_token.
- `BOT_APP_URL` — URL TMA (тот же домен, обычно корень web).

При старте API вызывает `setWebhook` на `<BOT_WEBHOOK_BASE_URL>/api/bot/webhook/<secret>`. Локальная отладка — через `ngrok http 8080`.

Команды бота:
- `/start` — приветствие + кнопка TMA.
- `/languages` — список выбранных и доступных языков.
- `/add <code>`, `/remove <code>` — управление списком.
- `/app` — кнопка открытия TMA.
- Любой текст в private chat — авто-конвертация.
- Inline: `@bot текст` — single-result preview.

## Поддерживаемые языки (MVP)

`en, ru, uk, be, de, fr, el, he, tr`. Каждый язык несёт топ-3000 слов: 8 из них взяты из [hermitdave/FrequencyWords](https://github.com/hermitdave/FrequencyWords) (frequency-sorted на основе OpenSubtitles 2018), `be` — из словарной базы LibreOffice [be-official.dic](https://github.com/LibreOffice/dictionaries/tree/master/be_BY).

Добавление нового языка — два файла:
1. `src/Switcher.Core/Layouts/<code>.json` — `id`, `name`, `language`, `normal` (46 chars), `shift` (46 chars).
2. `src/Switcher.Core/LanguageModels/<code>.txt` — словарь распространённых слов (одно слово в строке).

Алфавит для скоринга вычисляется автоматически из символов раскладки.

## Caps Lock-эвристика

Детектор пробует не только раскладки, но и инвертированный регистр (`gHBDTN` → `Привет` вместо `пРИВЕТ`). При равном скоре между «как написано» и «с перевёрнутым регистром» побеждает вариант с более естественным паттерном регистра — Title-case или all-lower выигрывают у «1 нижний + N верхних» (отметина Caps Lock). Намеренный ALL CAPS не флипается, потому что у такого ввода нет смешанного регистра.

## Миграции

Схема БД управляется через EF Core migrations в `src/Switcher.Api/Persistence/Migrations`. При старте API на реляционном провайдере вызывается `MigrateAsync`; in-memory dev-режим использует `EnsureCreated`.

Создать новую миграцию:
```
dotnet ef migrations add <Name> --project src/Switcher.Api --startup-project src/Switcher.Api --output-dir Persistence/Migrations
```
Дизайн-таймовый `AppDbContextFactory` использует `ConnectionStrings__Default` из env или дефолт на `localhost:5432`.

Применить локально:
```
dotnet ef database update --project src/Switcher.Api --startup-project src/Switcher.Api
```

## Тесты

```
dotnet test
```

285 unit- и integration-тестов: инварианты раскладок (4×9), round-trip конвертера на топ-10 слов на язык, матричный детектор по всем парам, edge-кейсы (пунктуация, override, пустой ввод, неизвестный язык, Caps Lock), и WebApplicationFactory-тесты `/api/convert` (200/413/400) и `/api/languages`. Диагностический `ScoreProbe` помечен `Skip`.
