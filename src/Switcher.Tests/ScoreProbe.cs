using Switcher.Core;
using Xunit.Abstractions;

namespace Switcher.Tests;

public class ScoreProbe(ITestOutputHelper output)
{
    private static readonly LayoutRegistry Registry = LayoutRegistry.LoadEmbedded();

    [Theory(Skip = "Diagnostic only — un-skip locally to inspect scores")]
    [InlineData("ru", "не")]
    [InlineData("ru", "что")]
    [InlineData("ru", "и")]
    [InlineData("el", "τον")]
    [InlineData("he", "את")]
    [InlineData("tr", "bir")]
    [InlineData("fr", "avoir")]
    [InlineData("de", "zu")]
    public void Probe(string lang, string word)
    {
        var foreign = Registry.GetLayout(lang);
        var en = Registry.GetLayout("en");
        var typedOnEn = LayoutConverter.Convert(word, foreign, en);

        var enModel = Registry.GetModel("en");
        var fmodel = Registry.GetModel(lang);

        output.WriteLine($"input={word} typedOnEn={typedOnEn}");
        output.WriteLine($"native_{lang}({word}) = {fmodel.Score(word):F2}");
        output.WriteLine($"native_en({word}) = {enModel.Score(word):F2}");
        output.WriteLine($"native_en({typedOnEn}) = {enModel.Score(typedOnEn):F2}");
        output.WriteLine($"swap_{lang}({typedOnEn}→{word}) = {fmodel.Score(word):F2}");
        output.WriteLine("---");
    }
}
