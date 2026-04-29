using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Switcher.Api.Auth;
using Switcher.Api.Persistence;

namespace Switcher.Api.Endpoints;

public static class SettingsEndpoint
{
    public sealed record SettingsDto(string[] Languages, string? DefaultTarget);

    public static void Map(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/me/settings");
        group.MapGet("/", GetAsync);
        group.MapPut("/", PutAsync);
    }

    private static async Task<Results<Ok<SettingsDto>, UnauthorizedHttpResult>> GetAsync(
        HttpContext ctx,
        AppDbContext db,
        IOptions<BotOptions> botOpts,
        CancellationToken ct)
    {
        var tg = await ResolveUser(ctx, db, botOpts.Value, ct);
        if (tg is null) return TypedResults.Unauthorized();
        var s = tg.Settings!;
        return TypedResults.Ok(new SettingsDto(s.Languages.ToArray(), s.DefaultTarget));
    }

    private static async Task<Results<Ok<SettingsDto>, UnauthorizedHttpResult, BadRequest<string>>> PutAsync(
        SettingsDto body,
        HttpContext ctx,
        AppDbContext db,
        IOptions<BotOptions> botOpts,
        CancellationToken ct)
    {
        if (body.Languages is null || body.Languages.Length == 0)
            return TypedResults.BadRequest("languages must contain at least one entry");

        var tg = await ResolveUser(ctx, db, botOpts.Value, ct);
        if (tg is null) return TypedResults.Unauthorized();

        tg.Settings!.Languages = body.Languages.Distinct().ToList();
        tg.Settings.DefaultTarget = body.DefaultTarget;
        tg.Settings.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(ct);
        return TypedResults.Ok(new SettingsDto(tg.Settings.Languages.ToArray(), tg.Settings.DefaultTarget));
    }

    private static async Task<User?> ResolveUser(
        HttpContext ctx,
        AppDbContext db,
        BotOptions opts,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(opts.Token)) return null;
        if (!ctx.Request.Headers.TryGetValue("X-Tg-InitData", out var initData)) return null;

        var validated = TelegramInitData.Validate(initData!, opts.Token, TimeSpan.FromHours(24));
        if (validated is null) return null;

        return await db.UpsertUserAsync(validated.Id, ct);
    }
}
