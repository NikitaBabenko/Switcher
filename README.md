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

`en, ru, uk, be, de, fr, el, he, tr`. Добавление нового — два файла:
1. `src/Switcher.Core/Layouts/<code>.json` — `id`, `name`, `language`, `normal` (46 chars), `shift` (46 chars).
2. `src/Switcher.Core/LanguageModels/<code>.txt` — словарь распространённых слов (одно слово в строке).

Алфавит для скоринга вычисляется автоматически из символов раскладки.

## Тесты

```
dotnet test
```

13 unit-тестов проверяют конвертер (round-trip RU↔EN, известные пары, преобразование пунктуации) и детектор (авто-направление, override, игнорирование одного языка).
