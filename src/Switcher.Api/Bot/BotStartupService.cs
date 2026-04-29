using Microsoft.Extensions.Options;
using Telegram.Bot;

namespace Switcher.Api.Bot;

public sealed class BotStartupService(
    ITelegramBotClient bot,
    IOptions<BotOptions> options,
    ILogger<BotStartupService> logger) : IHostedService
{
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        var opts = options.Value;
        if (!opts.Enabled || string.IsNullOrWhiteSpace(opts.WebhookBaseUrl) || string.IsNullOrWhiteSpace(opts.WebhookSecret))
        {
            logger.LogInformation("Bot disabled or webhook not configured; skipping SetWebhook.");
            return;
        }

        var url = $"{opts.WebhookBaseUrl.TrimEnd('/')}/api/bot/webhook/{opts.WebhookSecret}";
        try
        {
            await bot.SetWebhook(url, secretToken: opts.WebhookSecret, cancellationToken: cancellationToken);
            logger.LogInformation("Webhook set to {Url}", url);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "SetWebhook failed");
        }
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
