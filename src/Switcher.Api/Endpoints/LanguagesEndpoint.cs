using Switcher.Core;

namespace Switcher.Api.Endpoints;

public static class LanguagesEndpoint
{
    public sealed record LanguageDto(string Id, string Name, string Language);

    public static void Map(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/languages", (LayoutRegistry registry) =>
            registry.Layouts
                .Select(l => new LanguageDto(l.Id, l.Name, l.Language))
                .OrderBy(l => l.Id)
                .ToList());
    }
}
