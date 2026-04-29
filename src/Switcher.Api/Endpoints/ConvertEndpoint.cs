using Microsoft.AspNetCore.Http.HttpResults;
using Switcher.Core;

namespace Switcher.Api.Endpoints;

public static class ConvertEndpoint
{
    public sealed record OverrideDto(string From, string To);

    public sealed record ConvertRequest(string Text, string[]? Languages, OverrideDto? Override);

    public sealed record AlternativeDto(string Text, string From, string To, double Score);

    public sealed record ConvertResponse(
        string Result,
        bool Swapped,
        OverrideDto? Detected,
        IReadOnlyList<AlternativeDto> Alternatives);

    public static void Map(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/convert", Handle);
    }

    private static Results<Ok<ConvertResponse>, BadRequest<string>> Handle(
        ConvertRequest req,
        LayoutDetector detector)
    {
        if (req is null || req.Text is null)
            return TypedResults.BadRequest("text is required");

        var languages = req.Languages?.Length > 0 ? req.Languages : ["en", "ru"];
        DetectedDirection? @override = req.Override is null
            ? null
            : new DetectedDirection(req.Override.From, req.Override.To);

        var result = detector.Detect(req.Text, languages, @override);
        var detected = result.Detected is null ? null : new OverrideDto(result.Detected.From, result.Detected.To);
        var alts = result.Alternatives
            .Select(a => new AlternativeDto(a.Text, a.From, a.To, a.Score))
            .ToList();

        return TypedResults.Ok(new ConvertResponse(result.Result, result.Swapped, detected, alts));
    }
}
