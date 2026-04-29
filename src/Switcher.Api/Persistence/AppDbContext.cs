using Microsoft.EntityFrameworkCore;

namespace Switcher.Api.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<UserSettings> UserSettings => Set<UserSettings>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<User>(e =>
        {
            e.HasKey(u => u.Id);
            e.HasIndex(u => u.TelegramId).IsUnique();
            e.HasOne(u => u.Settings)
                .WithOne(s => s.User!)
                .HasForeignKey<UserSettings>(s => s.UserId);
        });

        b.Entity<UserSettings>(e =>
        {
            e.HasKey(s => s.UserId);
            e.Property(s => s.Languages).HasColumnType("text[]");
        });
    }

    public async Task<User> UpsertUserAsync(long telegramId, CancellationToken ct)
    {
        var user = await Users.Include(u => u.Settings).FirstOrDefaultAsync(u => u.TelegramId == telegramId, ct);
        var now = DateTimeOffset.UtcNow;
        if (user is null)
        {
            user = new User
            {
                TelegramId = telegramId,
                CreatedAt = now,
                UpdatedAt = now,
                Settings = new UserSettings { UpdatedAt = now }
            };
            Users.Add(user);
            await SaveChangesAsync(ct);
        }
        else if (user.Settings is null)
        {
            user.Settings = new UserSettings { UserId = user.Id, UpdatedAt = now };
            UserSettings.Add(user.Settings);
            await SaveChangesAsync(ct);
        }
        return user;
    }
}
