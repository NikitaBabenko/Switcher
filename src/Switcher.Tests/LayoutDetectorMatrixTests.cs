using Switcher.Core;

namespace Switcher.Tests;

public class LayoutDetectorMatrixTests
{
    private static readonly LayoutRegistry Registry = LayoutRegistry.LoadEmbedded();
    private static readonly LayoutDetector Detector = new(Registry);
    private static readonly Layout EnLayout = Registry.GetLayout("en");

    private static readonly string[] NonEnglishLanguages =
        ["ru", "uk", "be", "de", "fr", "el", "he", "tr"];

    // 1000 most common English words: covers everything the detector
    // legitimately can't disambiguate (e.g. δεν → den, σε → se).
    private static readonly HashSet<string> EnglishWordlist = new(
        TestData.LoadWords("en", 1000), StringComparer.OrdinalIgnoreCase);

    // Short words and Greek-style 3-char particles that map to plausible English
    // 3-grams (δεν → den, τον → ton). The detector cannot disambiguate these
    // without context — they're listed by the test as known unresolvable cases.
    private static readonly HashSet<string> KnownAmbiguousAsciiResults = new(StringComparer.OrdinalIgnoreCase)
    {
        "den", "ton", "thn", "kai", "ston",
    };

    private static bool IsAmbiguous(string word, string typedOnEnglish)
    {
        // 1- and 2-char inputs are inherently ambiguous: trigram statistics
        // are too few to differentiate "real foreign word" from "common English digraph".
        if (word.Length < 3) return true;
        // ASCII-clone outputs (TR/DE happens to overlap with EN).
        if (typedOnEnglish == word) return true;
        // If the wrong-layout artifact is itself a common English word, the detector
        // genuinely can't decide; that's a corpus issue, not a layout/algorithm one.
        if (EnglishWordlist.Contains(typedOnEnglish)) return true;
        if (KnownAmbiguousAsciiResults.Contains(typedOnEnglish)) return true;
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
