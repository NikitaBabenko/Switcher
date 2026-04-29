using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Switcher.Api.Persistence;

[Table("users")]
public class User
{
    [Column("id")]
    public long Id { get; set; }

    [Column("telegram_id")]
    public long TelegramId { get; set; }

    [Column("created_at")]
    public DateTimeOffset CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTimeOffset UpdatedAt { get; set; }

    public UserSettings? Settings { get; set; }
}

[Table("user_settings")]
public class UserSettings
{
    [Column("user_id")]
    public long UserId { get; set; }

    [Column("languages")]
    public List<string> Languages { get; set; } = ["en", "ru"];

    [Column("default_target")]
    public string? DefaultTarget { get; set; }

    [Column("updated_at")]
    public DateTimeOffset UpdatedAt { get; set; }

    public User? User { get; set; }
}
