using Switcher.Core;

namespace Switcher.Tests;

public class LayoutConverterTests
{
    private static readonly LayoutRegistry Registry = LayoutRegistry.LoadEmbedded();

    [Fact]
    public void Layouts_NormalAndShift_HaveLength46()
    {
        foreach (var layout in Registry.Layouts)
        {
            Assert.Equal(46, layout.Normal.Length);
            Assert.Equal(46, layout.Shift.Length);
        }
    }

    [Theory]
    [InlineData("en", "ru", "ghbdtn", "привет")]
    [InlineData("en", "ru", "ds rkfccyj", "вы классно")]
    [InlineData("ru", "en", "руддщ", "hello")]
    [InlineData("ru", "en", "руддщ цщкдв", "hello world")]
    public void Convert_KnownPairs(string from, string to, string input, string expected)
    {
        var fromL = Registry.GetLayout(from);
        var toL = Registry.GetLayout(to);
        var actual = LayoutConverter.Convert(input, fromL, toL);
        Assert.Equal(expected, actual);
    }

    [Fact]
    public void Convert_Letters_AreRoundTrip()
    {
        var en = Registry.GetLayout("en");
        var ru = Registry.GetLayout("ru");
        const string original = "Hello, World!";
        var swapped = LayoutConverter.Convert(original, en, ru);
        var back = LayoutConverter.Convert(swapped, ru, en);
        Assert.Equal(original, back);
    }

    [Fact]
    public void Convert_PreservesUnknownCharacters()
    {
        var en = Registry.GetLayout("en");
        var ru = Registry.GetLayout("ru");
        Assert.Equal("123 ", LayoutConverter.Convert("123 ", en, ru));
    }
}
