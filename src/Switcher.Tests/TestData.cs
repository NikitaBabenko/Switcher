using System.Reflection;
using Switcher.Core;

namespace Switcher.Tests;

internal static class TestData
{
    public static IReadOnlyList<string> LoadWords(string language, int take)
    {
        var asm = typeof(LayoutRegistry).Assembly;
        var resource = $"Switcher.Core.LanguageModels.{language}.txt";
        using var stream = asm.GetManifestResourceStream(resource)
            ?? throw new InvalidOperationException($"Wordlist '{resource}' not found");
        using var reader = new StreamReader(stream);

        var result = new List<string>(take);
        string? line;
        while ((line = reader.ReadLine()) is not null && result.Count < take)
        {
            var trimmed = line.Trim();
            if (trimmed.Length > 0 && !trimmed.StartsWith('#'))
                result.Add(trimmed);
        }
        return result;
    }
}
