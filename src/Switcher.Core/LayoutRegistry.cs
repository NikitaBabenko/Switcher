using System.Reflection;
using System.Text.Json;

namespace Switcher.Core;

public sealed class LayoutRegistry
{
    private readonly Dictionary<string, Layout> _layouts;
    private readonly Dictionary<string, LanguageModel> _models;

    public IReadOnlyCollection<Layout> Layouts => _layouts.Values;

    public Layout GetLayout(string id) =>
        _layouts.TryGetValue(id, out var l)
            ? l
            : throw new KeyNotFoundException($"Layout '{id}' not registered.");

    public LanguageModel GetModel(string language) =>
        _models.TryGetValue(language, out var m)
            ? m
            : throw new KeyNotFoundException($"Language model '{language}' not registered.");

    public bool HasLanguage(string language) => _layouts.ContainsKey(language);

    private LayoutRegistry(Dictionary<string, Layout> layouts, Dictionary<string, LanguageModel> models)
    {
        _layouts = layouts;
        _models = models;
    }

    public static LayoutRegistry LoadEmbedded()
    {
        var asm = typeof(LayoutRegistry).Assembly;
        var ns = typeof(LayoutRegistry).Namespace ?? "Switcher.Core";

        var layouts = new Dictionary<string, Layout>(StringComparer.Ordinal);
        var models = new Dictionary<string, LanguageModel>(StringComparer.Ordinal);

        foreach (var resource in asm.GetManifestResourceNames())
        {
            if (!resource.StartsWith($"{ns}.Layouts.") || !resource.EndsWith(".json"))
                continue;
            using var stream = asm.GetManifestResourceStream(resource)!;
            var dto = JsonSerializer.Deserialize<LayoutDto>(stream, JsonOpts)
                      ?? throw new InvalidOperationException($"Failed to parse {resource}");
            var layout = new Layout(dto.Id, dto.Name, dto.Language, dto.Normal, dto.Shift);
            layouts[layout.Id] = layout;
        }

        foreach (var (id, layout) in layouts)
        {
            var resourceName = $"{ns}.LanguageModels.{id}.txt";
            var words = ReadWordlist(asm, resourceName);
            models[id] = new LanguageModel(id, layout.Alphabet, words);
        }

        return new LayoutRegistry(layouts, models);
    }

    private static IEnumerable<string> ReadWordlist(Assembly asm, string resourceName)
    {
        using var stream = asm.GetManifestResourceStream(resourceName);
        if (stream is null) yield break;
        using var reader = new StreamReader(stream);
        string? line;
        while ((line = reader.ReadLine()) is not null)
        {
            var trimmed = line.Trim();
            if (trimmed.Length > 0 && !trimmed.StartsWith('#'))
                yield return trimmed;
        }
    }

    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    private sealed record LayoutDto(string Id, string Name, string Language, string Normal, string Shift);
}
