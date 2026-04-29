using Switcher.Core;

namespace Switcher.Tests;

public class LayoutDataTests
{
    private static readonly LayoutRegistry Registry = LayoutRegistry.LoadEmbedded();

    public static IEnumerable<object[]> AllLayouts =>
        Registry.Layouts.Select(l => new object[] { l.Id });

    [Theory]
    [MemberData(nameof(AllLayouts))]
    public void Layout_Strings_AreFortySix(string id)
    {
        var layout = Registry.GetLayout(id);
        Assert.Equal(46, layout.Normal.Length);
        Assert.Equal(46, layout.Shift.Length);
    }

    [Theory]
    [MemberData(nameof(AllLayouts))]
    public void Layout_Metadata_IsPresent(string id)
    {
        var layout = Registry.GetLayout(id);
        Assert.False(string.IsNullOrWhiteSpace(layout.Id));
        Assert.False(string.IsNullOrWhiteSpace(layout.Name));
        Assert.False(string.IsNullOrWhiteSpace(layout.Language));
        Assert.Equal(layout.Id, layout.Language); // current convention
    }

    [Theory]
    [MemberData(nameof(AllLayouts))]
    public void Layout_Letters_HaveUniquePositionsWithinNormal(string id)
    {
        var layout = Registry.GetLayout(id);
        var seen = new Dictionary<char, int>();
        for (int i = 0; i < layout.Normal.Length; i++)
        {
            var c = layout.Normal[i];
            if (!char.IsLetter(c)) continue;
            Assert.False(seen.ContainsKey(c),
                $"Letter '{c}' duplicated in normal row of '{id}' at positions {seen.GetValueOrDefault(c)} and {i}");
            seen[c] = i;
        }
    }

    [Theory]
    [MemberData(nameof(AllLayouts))]
    public void Layout_LowercaseLetters_DoNotAppearInShift(string id)
    {
        // A lowercase letter in shift would mean shift+key produces the same case as normal,
        // which is unexpected on a real keyboard layout.
        var layout = Registry.GetLayout(id);
        var normalLetters = new HashSet<char>(layout.Normal.Where(char.IsLower));
        foreach (var c in layout.Shift)
        {
            if (char.IsLower(c) && normalLetters.Contains(c))
                Assert.Fail($"'{id}': lowercase letter '{c}' appears in shift row");
        }
    }
}
