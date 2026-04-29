using Microsoft.EntityFrameworkCore;
using Switcher.Api.Persistence;
using Switcher.Core;
using Telegram.Bot;
using Telegram.Bot.Types;
using Telegram.Bot.Types.Enums;
using Telegram.Bot.Types.InlineQueryResults;
using Telegram.Bot.Types.ReplyMarkups;
using DbUser = Switcher.Api.Persistence.User;

namespace Switcher.Api.Bot;

public sealed class BotUpdateHandler(
    ITelegramBotClient bot,
    LayoutDetector detector,
    LayoutRegistry registry,
    AppDbContext db,
    BotOptions options,
    ILogger<BotUpdateHandler> logger)
{
    public async Task HandleAsync(Update update, CancellationToken ct)
    {
        try
        {
            switch (update.Type)
            {
                case UpdateType.Message when update.Message is { } msg:
                    await HandleMessageAsync(msg, ct);
                    break;
                case UpdateType.InlineQuery when update.InlineQuery is { } iq:
                    await HandleInlineAsync(iq, ct);
                    break;
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to handle update {UpdateId}", update.Id);
        }
    }

    private async Task HandleMessageAsync(Message msg, CancellationToken ct)
    {
        if (msg.From is null || string.IsNullOrWhiteSpace(msg.Text)) return;

        var user = await db.UpsertUserAsync(msg.From.Id, ct);
        var settings = user.Settings!;
        var text = msg.Text.Trim();

        if (text.StartsWith('/'))
        {
            await HandleCommandAsync(msg, user, text, ct);
            return;
        }

        if (settings.Languages.Count < 2)
        {
            await bot.SendMessage(msg.Chat.Id,
                "Включи хотя бы два языка через /languages, чтобы я знал куда переключать.",
                cancellationToken: ct);
            return;
        }

        var result = detector.Detect(text, settings.Languages.ToArray());
        if (!result.Swapped)
        {
            await bot.SendMessage(msg.Chat.Id,
                "Текст уже в правильной раскладке — менять нечего.",
                replyParameters: new ReplyParameters { MessageId = msg.MessageId },
                cancellationToken: ct);
            return;
        }

        var arrow = $"{result.Detected!.From} → {result.Detected.To}";
        await bot.SendMessage(msg.Chat.Id,
            $"{result.Result}\n\n<i>{arrow}</i>",
            parseMode: ParseMode.Html,
            replyParameters: new ReplyParameters { MessageId = msg.MessageId },
            cancellationToken: ct);
    }

    private async Task HandleCommandAsync(Message msg, DbUser user, string text, CancellationToken ct)
    {
        var parts = text.Split(' ', 2, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        var cmd = parts[0].Split('@', 2)[0].ToLowerInvariant();
        var arg = parts.Length > 1 ? parts[1] : "";

        switch (cmd)
        {
            case "/start":
                {
                    var keyboard = !string.IsNullOrWhiteSpace(options.AppUrl)
                        ? new InlineKeyboardMarkup(InlineKeyboardButton.WithWebApp(
                            "Открыть приложение",
                            new WebAppInfo { Url = options.AppUrl }))
                        : null;
                    await bot.SendMessage(msg.Chat.Id,
                        "Привет! Пришли мне текст, набранный не на той раскладке — я переведу.\n\n" +
                        "Команды: /languages — список твоих языков; /add <code> — добавить; /remove <code> — убрать; /app — открыть приложение.",
                        replyMarkup: keyboard,
                        cancellationToken: ct);
                    return;
                }
            case "/app":
                {
                    if (string.IsNullOrWhiteSpace(options.AppUrl))
                    {
                        await bot.SendMessage(msg.Chat.Id, "Приложение не настроено.", cancellationToken: ct);
                        return;
                    }
                    var keyboard = new InlineKeyboardMarkup(InlineKeyboardButton.WithWebApp(
                        "Открыть приложение",
                        new WebAppInfo { Url = options.AppUrl }));
                    await bot.SendMessage(msg.Chat.Id, "Открываем:", replyMarkup: keyboard, cancellationToken: ct);
                    return;
                }
            case "/languages":
                {
                    var list = string.Join(", ", user.Settings!.Languages);
                    var available = string.Join(", ", registry.Layouts.Select(l => l.Id).OrderBy(s => s));
                    await bot.SendMessage(msg.Chat.Id,
                        $"Твои языки: {list}\nДоступные: {available}\nИспользуй /add <code> или /remove <code>.",
                        cancellationToken: ct);
                    return;
                }
            case "/add":
                {
                    var code = arg.Trim().ToLowerInvariant();
                    if (!registry.HasLanguage(code))
                    {
                        await bot.SendMessage(msg.Chat.Id, $"Не знаю язык '{code}'.", cancellationToken: ct);
                        return;
                    }
                    if (!user.Settings!.Languages.Contains(code))
                    {
                        user.Settings.Languages.Add(code);
                        user.Settings.UpdatedAt = DateTimeOffset.UtcNow;
                        await db.SaveChangesAsync(ct);
                    }
                    await bot.SendMessage(msg.Chat.Id,
                        $"Добавлен '{code}'. Сейчас: {string.Join(", ", user.Settings.Languages)}",
                        cancellationToken: ct);
                    return;
                }
            case "/remove":
                {
                    var code = arg.Trim().ToLowerInvariant();
                    if (user.Settings!.Languages.Remove(code))
                    {
                        user.Settings.UpdatedAt = DateTimeOffset.UtcNow;
                        await db.SaveChangesAsync(ct);
                    }
                    await bot.SendMessage(msg.Chat.Id,
                        $"Сейчас: {string.Join(", ", user.Settings.Languages)}",
                        cancellationToken: ct);
                    return;
                }
            default:
                await bot.SendMessage(msg.Chat.Id, "Неизвестная команда. /start для подсказки.", cancellationToken: ct);
                return;
        }
    }

    private async Task HandleInlineAsync(InlineQuery iq, CancellationToken ct)
    {
        var query = iq.Query?.Trim() ?? "";
        if (query.Length < 1)
        {
            await bot.AnswerInlineQuery(iq.Id, [], cancellationToken: ct);
            return;
        }

        var user = await db.Users.Include(u => u.Settings).FirstOrDefaultAsync(u => u.TelegramId == iq.From.Id, ct);
        var languages = user?.Settings?.Languages.ToArray() ?? ["en", "ru"];
        if (languages.Length < 2) languages = ["en", "ru"];

        var result = detector.Detect(query, languages);
        var converted = result.Result;
        var title = result.Swapped
            ? $"Переключить раскладку ({result.Detected!.From} → {result.Detected.To})"
            : "Текст уже в правильной раскладке";

        var article = new InlineQueryResultArticle(
            id: "1",
            title: title,
            inputMessageContent: new InputTextMessageContent(converted))
        {
            Description = converted
        };

        await bot.AnswerInlineQuery(iq.Id, [article], cacheTime: 1, cancellationToken: ct);
    }
}
