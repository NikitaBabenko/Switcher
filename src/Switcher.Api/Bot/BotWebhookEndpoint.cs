using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.Extensions.Options;
using Telegram.Bot.Types;

namespace Switcher.Api.Bot;

public static class BotWebhookEndpoint
{
    public static void Map(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/bot/webhook/{secret}", Handle);
    }

    private static async Task<Results<Ok, UnauthorizedHttpResult>> Handle(
        string secret,
        Update update,
        HttpContext ctx,
        IOptions<BotOptions> options,
        BotUpdateHandler handler,
        CancellationToken ct)
    {
        var opts = options.Value;
        if (!string.Equals(secret, opts.WebhookSecret, StringComparison.Ordinal))
            return TypedResults.Unauthorized();

        if (!string.IsNullOrEmpty(opts.WebhookSecret) &&
            ctx.Request.Headers.TryGetValue("X-Telegram-Bot-Api-Secret-Token", out var headerToken) &&
            !string.Equals(headerToken.ToString(), opts.WebhookSecret, StringComparison.Ordinal))
        {
            return TypedResults.Unauthorized();
        }

        await handler.HandleAsync(update, ct);
        return TypedResults.Ok();
    }
}
