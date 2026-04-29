using Switcher.Core;

namespace Switcher.Tests;

public class LayoutConverterRoundTripTests
{
    private static readonly LayoutRegistry Registry = LayoutRegistry.LoadEmbedded();
    private static readonly Layout EnLayout = Registry.GetLayout("en");

    private static readonly string[] NonEnglishLanguages =
        ["ru", "uk", "be", "de", "fr", "el", "he", "tr"];

    public static IEnumerable<object[]> LanguageWordPairs()
    {
        foreach (var lang in NonEnglishLanguages)
        {
            var words = TestData.LoadWords(lang, 10);
            foreach (var word in words)
                yield return new object[] { lang, word };
        }
    }

    [Theory]
    [MemberData(nameof(LanguageWordPairs))]
    public void RoundTrip_FromForeignThroughEnglishAndBack_PreservesWord(string language, string word)
    {
        var foreignLayout = Registry.GetLayout(language);

        var typedOnEnglish = LayoutConverter.Convert(word, foreignLayout, EnLayout);
        var restored = LayoutConverter.Convert(typedOnEnglish, EnLayout, foreignLayout);

        Assert.Equal(word, restored);
    }

    [Theory]
    [MemberData(nameof(LanguageWordPairs))]
    public void RoundTrip_FromEnglishThroughForeignAndBack_PreservesEnglishView(string language, string word)
    {
        var foreignLayout = Registry.GetLayout(language);

        var typedOnEnglish = LayoutConverter.Convert(word, foreignLayout, EnLayout);
        if (typedOnEnglish == word) return; // trivial — no swap-mapping involved

        var foreign = LayoutConverter.Convert(typedOnEnglish, EnLayout, foreignLayout);
        var backToEnglish = LayoutConverter.Convert(foreign, foreignLayout, EnLayout);

        Assert.Equal(typedOnEnglish, backToEnglish);
    }
}
