using Switcher.Core;

namespace Switcher.Tests;

public class LayoutDetectorMatrixTests
{
    private static readonly LayoutRegistry Registry = LayoutRegistry.LoadEmbedded();
    private static readonly LayoutDetector Detector = new(Registry);
    private static readonly Layout EnLayout = Registry.GetLayout("en");

    private static readonly string[] NonEnglishLanguages =
        ["ru", "uk", "be", "de", "fr", "el", "he", "tr"];

    private static readonly HashSet<string> EnglishWordlist = new(
        TestData.LoadWords("en", 200), StringComparer.OrdinalIgnoreCase);

    private static bool IsAmbiguous(string word, string typedOnEnglish)
    {
        // 1- and 2-char inputs are inherently ambiguous: trigram statistics are too few
        // to differentiate "real foreign word" from "common English digraph".
        if (word.Length < 3) return true;
        // ASCII-clone outputs (TR/DE happens to overlap with EN).
        if (typedOnEnglish == word) return true;
        // If the wrong-layout artifact is itself a common English word, the detector
        // genuinely can't decide; that's a corpus problem, not a layout/algorithm problem.
        if (EnglishWordlist.Contains(typedOnEnglish)) return true;
        return false;
    }

    public static IEnumerable<object[]> NativeCases()
    {
        foreach (var lang in NonEnglishLanguages)
        {
            var foreign = Registry.GetLayout(lang);
            foreach (var word in TestData.LoadWords(lang, 10))
            {
                var typedOnEnglish = LayoutConverter.Convert(word, foreign, EnLayout);
                if (IsAmbiguous(word, typedOnEnglish)) continue;
                yield return new object[] { lang, word };
            }
        }
    }

    public static IEnumerable<object[]> SwapCases()
    {
        foreach (var lang in NonEnglishLanguages)
        {
            var foreign = Registry.GetLayout(lang);
            foreach (var word in TestData.LoadWords(lang, 10))
            {
                var typedOnEnglish = LayoutConverter.Convert(word, foreign, EnLayout);
                if (IsAmbiguous(word, typedOnEnglish)) continue;
                yield return new object[] { lang, word, typedOnEnglish };
            }
        }
    }

    [Theory]
    [MemberData(nameof(NativeCases))]
    public void NativeText_IsNotSwapped(string language, string word)
    {
        var result = Detector.Detect(word, ["en", language]);
        Assert.False(result.Swapped, $"'{word}' ({language}) was swapped to '{result.Result}'");
        Assert.Equal(word, result.Result);
    }

    [Theory]
    [MemberData(nameof(SwapCases))]
    public void TextTypedOnWrongEnglishLayout_IsRecognizedAndSwapped(string language, string word, string typedOnEnglish)
    {
        var result = Detector.Detect(typedOnEnglish, ["en", language]);
        Assert.True(result.Swapped, $"'{typedOnEnglish}' was not detected as wrong-layout for {language}");
        Assert.Equal(word, result.Result);
        Assert.Equal("en", result.Detected!.From);
        Assert.Equal(language, result.Detected.To);
    }
}
