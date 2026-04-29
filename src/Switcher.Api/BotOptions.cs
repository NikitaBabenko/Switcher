namespace Switcher.Api;

public sealed class BotOptions
{
    public string? Token { get; set; }
    public string? WebhookBaseUrl { get; set; }
    public string? WebhookSecret { get; set; }
    public string? AppUrl { get; set; }

    public bool Enabled => !string.IsNullOrWhiteSpace(Token);
}
