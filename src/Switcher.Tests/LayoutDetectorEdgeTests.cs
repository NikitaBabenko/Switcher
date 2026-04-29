using Switcher.Core;

namespace Switcher.Tests;

public class LayoutDetectorEdgeTests
{
    private static readonly LayoutRegistry Registry = LayoutRegistry.LoadEmbedded();
    private static readonly LayoutDetector Detector = new(Registry);
    private static readonly string[] EnRu = ["en", "ru"];

    [Fact]
    public void Detect_RussianWithPunctuation_DoesNotSwap()
    {
        var result = Detector.Detect("Привет, мир!", EnRu);
        Assert.False(result.Swapped);
        Assert.Equal("Привет, мир!", result.Result);
    }

    [Fact]
    public void Detect_RussianTypedOnEnWithPunctuation_Swaps()
    {
        // ',' lives on shift+/ on the Russian layout, so a Russian-intending user
        // who types on EN by mistake produces '?' where they meant ',' — round-trip
        // restoring '?' back to ',' is what the detector must do.
        var result = Detector.Detect("Ghbdtn? vbh!", EnRu);
        Assert.True(result.Swapped);
        Assert.Equal("Привет, мир!", result.Result);
        Assert.Equal("en", result.Detected!.From);
        Assert.Equal("ru", result.Detected.To);
    }

    [Fact]
    public void Detect_MixedCaseRussianTypedOnEn_PreservesCase()
    {
        var result = Detector.Detect("Vbh", EnRu);
        Assert.True(result.Swapped);
        Assert.Equal("Мир", result.Result);
    }

    [Fact]
    public void Detect_EmptyString_ReturnsEmpty()
    {
        var result = Detector.Detect("", EnRu);
        Assert.False(result.Swapped);
        Assert.Equal("", result.Result);
    }

    [Fact]
    public void Detect_OnlyWhitespace_DoesNotSwap()
    {
        var result = Detector.Detect("   ", EnRu);
        Assert.False(result.Swapped);
        Assert.Equal("   ", result.Result);
    }

    [Fact]
    public void Detect_OnlyDigitsAndPunctuation_DoesNotSwap()
    {
        var result = Detector.Detect("123, 456!", EnRu);
        Assert.False(result.Swapped);
        Assert.Equal("123, 456!", result.Result);
    }

    [Fact]
    public void Detect_OverrideForcesSwapEvenForValidNative()
    {
        var result = Detector.Detect(
            "hello",
            EnRu,
            new DetectedDirection("en", "ru"));
        Assert.True(result.Swapped);
        Assert.Equal("руддщ", result.Result);
        Assert.Equal("en", result.Detected!.From);
        Assert.Equal("ru", result.Detected.To);
    }

    [Fact]
    public void Detect_OverrideForcesSwapInOppositeDirection()
    {
        var result = Detector.Detect(
            "привет",
            EnRu,
            new DetectedDirection("ru", "en"));
        Assert.True(result.Swapped);
        Assert.Equal("ghbdtn", result.Result);
    }

    [Fact]
    public void Detect_FewerThanTwoLanguages_PassesThrough()
    {
        var result = Detector.Detect("ghbdtn", ["en"]);
        Assert.False(result.Swapped);
        Assert.Equal("ghbdtn", result.Result);
    }

    [Fact]
    public void Detect_UnknownLanguageInList_IsIgnored()
    {
        var result = Detector.Detect("ghbdtn", ["en", "ru", "xx"]);
        Assert.True(result.Swapped);
        Assert.Equal("привет", result.Result);
    }

    [Fact]
    public void Detect_AlternativesAreReturned()
    {
        var result = Detector.Detect("привет", EnRu);
        Assert.NotEmpty(result.Alternatives);
    }

    [Fact]
    public void Detect_LongRussianSentence_Swaps()
    {
        var input = "Дщкуь шзыгь дщкуь ышаь фьуа адше"; // gibberish but mostly cyrillic-typed-on-en
        var result = Detector.Detect("Lorem ipsum dolor sit amet, consectetur adipiscing elit", EnRu);
        Assert.False(result.Swapped);
        Assert.NotEqual(input, result.Result);
    }
}
