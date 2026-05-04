using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Microsoft.EntityFrameworkCore;
using Switcher.Api;
using Switcher.Api.Bot;
using Switcher.Api.Endpoints;
using Switcher.Api.Persistence;
using Switcher.Core;
using Telegram.Bot;

var builder = WebApplication.CreateBuilder(args);

// Cap request body. /api/convert validates a tighter limit on the text field itself.
builder.Services.Configure<KestrelServerOptions>(o => o.Limits.MaxRequestBodySize = 256 * 1024);

builder.Services.Configure<BotOptions>(builder.Configuration.GetSection("Bot"));
builder.Services.AddSingleton(sp =>
    sp.GetRequiredService<Microsoft.Extensions.Options.IOptions<BotOptions>>().Value);

builder.Services.AddSingleton(_ => LayoutRegistry.LoadEmbedded());
builder.Services.AddSingleton<LayoutDetector>();

var connectionString = builder.Configuration.GetConnectionString("Default");
if (!string.IsNullOrWhiteSpace(connectionString))
{
    builder.Services.AddDbContext<AppDbContext>(opt => opt.UseNpgsql(connectionString));
}
else
{
    builder.Services.AddDbContext<AppDbContext>(opt => opt.UseInMemoryDatabase("switcher-dev"));
}

var botToken = builder.Configuration["Bot:Token"];
if (!string.IsNullOrWhiteSpace(botToken))
{
    builder.Services.AddHttpClient("telegram_bot")
        .AddTypedClient<ITelegramBotClient>((http, _) => new TelegramBotClient(botToken!, http));
    builder.Services.AddScoped<BotUpdateHandler>();
    builder.Services.AddHostedService<BotStartupService>();
}

builder.Services.AddCors(opt => opt.AddDefaultPolicy(p => p
    .AllowAnyOrigin()
    .AllowAnyHeader()
    .AllowAnyMethod()));

// Per-IP fixed-window rate limit on /api/convert. Tuned to stay well above
// realistic single-user usage (a click rarely fires more than 1-2 conversions
// per second) while making mass scripted abuse expensive.
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
    {
        if (httpContext.Request.Path.StartsWithSegments("/api/convert"))
        {
            var key = httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            return RateLimitPartition.GetFixedWindowLimiter(key, _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 60,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0,
            });
        }
        return RateLimitPartition.GetNoLimiter("noop");
    });
});

var app = builder.Build();

{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    if (db.Database.IsRelational())
        await db.Database.MigrateAsync();
    else
        await db.Database.EnsureCreatedAsync();
}

app.UseCors();
app.UseRateLimiter();

ConvertEndpoint.Map(app);
LanguagesEndpoint.Map(app);
SettingsEndpoint.Map(app);
if (!string.IsNullOrWhiteSpace(botToken))
{
    BotWebhookEndpoint.Map(app);
}

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

await app.RunAsync();

public partial class Program;
