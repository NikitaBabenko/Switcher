using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Web;

namespace Switcher.Api.Auth;

public static class TelegramInitData
{
    public sealed record InitDataUser(long Id, string? Username, string? FirstName, string? LastName, string? LanguageCode);

    public static InitDataUser? Validate(string initData, string botToken, TimeSpan? maxAge = null)
    {
        if (string.IsNullOrWhiteSpace(initData) || string.IsNullOrWhiteSpace(botToken))
            return null;

        var parsed = HttpUtility.ParseQueryString(initData);
        var hash = parsed["hash"];
        if (string.IsNullOrWhiteSpace(hash)) return null;

        var keys = parsed.AllKeys
            .Where(k => k is not null && k != "hash")
            .Cast<string>()
            .OrderBy(k => k, StringComparer.Ordinal);

        var dataCheckString = string.Join("\n", keys.Select(k => $"{k}={parsed[k]}"));
        var secretKey = HMACSHA256.HashData("WebAppData"u8.ToArray(), Encoding.UTF8.GetBytes(botToken));
        var computed = HMACSHA256.HashData(secretKey, Encoding.UTF8.GetBytes(dataCheckString));
        var computedHex = Convert.ToHexStringLower(computed);
        if (!CryptographicOperations.FixedTimeEquals(
                Encoding.ASCII.GetBytes(computedHex),
                Encoding.ASCII.GetBytes(hash.ToLowerInvariant())))
            return null;

        if (maxAge is { } age && long.TryParse(parsed["auth_date"], out var authDate))
        {
            var ts = DateTimeOffset.FromUnixTimeSeconds(authDate);
            if (DateTimeOffset.UtcNow - ts > age) return null;
        }

        var userJson = parsed["user"];
        if (string.IsNullOrWhiteSpace(userJson)) return null;

        try
        {
            using var doc = JsonDocument.Parse(userJson);
            var root = doc.RootElement;
            return new InitDataUser(
                root.GetProperty("id").GetInt64(),
                root.TryGetProperty("username", out var u) ? u.GetString() : null,
                root.TryGetProperty("first_name", out var f) ? f.GetString() : null,
                root.TryGetProperty("last_name", out var l) ? l.GetString() : null,
                root.TryGetProperty("language_code", out var lc) ? lc.GetString() : null);
        }
        catch (JsonException)
        {
            return null;
        }
    }
}
