using Switcher.Core;

namespace Switcher.Tests;

public class LayoutDetectorTests
{
    private static readonly LayoutRegistry Registry = LayoutRegistry.LoadEmbedded();
    private static readonly LayoutDetector Detector = new(Registry);

    private static readonly string[] EnRu = ["en", "ru"];

    [Fact]
    public void Detect_PlainEnglish_NotSwapped()
    {
        var result = Detector.Detect("hello world", EnRu);
        Assert.False(result.Swapped);
        Assert.Equal("hello world", result.Result);
    }

    [Fact]
    public void Detect_PlainRussian_NotSwapped()
    {
        var result = Detector.Detect("привет мир", EnRu);
        Assert.False(result.Swapped);
        Assert.Equal("привет мир", result.Result);
    }

    [Fact]
    public void Detect_RussianTypedOnEn_DetectsAndSwaps()
    {
        // "привет" typed accidentally on EN layout → "ghbdtn"
        var result = Detector.Detect("ghbdtn", EnRu);
        Assert.True(result.Swapped);
        Assert.Equal("en", result.Detected!.From);
        Assert.Equal("ru", result.Detected.To);
        Assert.Equal("привет", result.Result);
    }

    [Fact]
    public void Detect_EnglishTypedOnRu_DetectsAndSwaps()
    {
        // "hello" typed accidentally on RU layout → "руддщ"
        var result = Detector.Detect("руддщ", EnRu);
        Assert.True(result.Swapped);
        Assert.Equal("ru", result.Detected!.From);
        Assert.Equal("en", result.Detected.To);
        Assert.Equal("hello", result.Result);
    }

    [Fact]
    public void Detect_OverrideForcesDirection()
    {
        var result = Detector.Detect(
            "hello",
            EnRu,
            new DetectedDirection("en", "ru"));
        Assert.True(result.Swapped);
        Assert.Equal("руддщ", result.Result);
    }

    [Fact]
    public void Detect_FewerThanTwoLanguages_PassesThrough()
    {
        var result = Detector.Detect("ghbdtn", ["en"]);
        Assert.False(result.Swapped);
        Assert.Equal("ghbdtn", result.Result);
    }
}
