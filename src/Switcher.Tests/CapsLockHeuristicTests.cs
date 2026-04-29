using Switcher.Core;

namespace Switcher.Tests;

public class CapsLockHeuristicTests
{
    private static readonly LayoutRegistry Registry = LayoutRegistry.LoadEmbedded();
    private static readonly LayoutDetector Detector = new(Registry);
    private static readonly string[] EnRu = ["en", "ru"];

    [Fact]
    public void RussianTypedOnEn_WithCapsLockOn_RecoversTitleCase()
    {
        // User wanted "Привет" (Title-case Russian), had Caps Lock + EN layout.
        // Caps Lock inverts case: shift+G (intended capital П) → 'g' lowercase;
        // 'h','b','d','t','n' (intended lowercase) → 'H','B','D','T','N' uppercase.
        var result = Detector.Detect("gHBDTN", EnRu);
        Assert.True(result.Swapped);
        Assert.Equal("Привет", result.Result);
        Assert.Equal("en", result.Detected!.From);
        Assert.Equal("ru", result.Detected.To);
    }

    [Fact]
    public void EnglishTypedOnRu_WithCapsLockOn_RecoversTitleCase()
    {
        // User wanted "Hello" on RU layout with Caps Lock — got 'рУДДЩ'.
        var result = Detector.Detect("рУДДЩ", EnRu);
        Assert.True(result.Swapped);
        Assert.Equal("Hello", result.Result);
        Assert.Equal("ru", result.Detected!.From);
        Assert.Equal("en", result.Detected.To);
    }

    [Fact]
    public void DeliberateAllCaps_IsNotFlipped()
    {
        // No mixed case → caps-lock branch not even considered.
        var result = Detector.Detect("ПРИВЕТ", EnRu);
        Assert.False(result.Swapped);
        Assert.Equal("ПРИВЕТ", result.Result);
    }

    [Fact]
    public void MixedCaseEmphasis_DoesNotGetCaseFlipped()
    {
        // "Hello WORLD" — mixed case but a real English sentence with emphasis.
        // Original lowercase ratio (7/10) > flipped (3/10), and the EN model is
        // case-insensitive, so the tiebreak keeps the original.
        var result = Detector.Detect("Hello WORLD", EnRu);
        Assert.False(result.Swapped);
        Assert.Equal("Hello WORLD", result.Result);
    }

    [Fact]
    public void NormalNativeText_StillNotSwapped()
    {
        var result = Detector.Detect("Привет, мир!", EnRu);
        Assert.False(result.Swapped);
        Assert.Equal("Привет, мир!", result.Result);
    }
}
