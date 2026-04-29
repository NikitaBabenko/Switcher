namespace Switcher.Core;

public sealed class LayoutDetector
{
    private readonly LayoutRegistry _registry;

    public LayoutDetector(LayoutRegistry registry) => _registry = registry;

    public ConversionResult Detect(string text, IReadOnlyList<string> enabledLanguages, DetectedDirection? @override = null)
    {
        if (string.IsNullOrEmpty(text))
            return new ConversionResult(text, false, null, []);

        if (@override is not null)
        {
            var fromL = _registry.GetLayout(@override.From);
            var toL = _registry.GetLayout(@override.To);
            var converted = LayoutConverter.Convert(text, fromL, toL);
            return new ConversionResult(converted, true, @override, []);
        }

        var langs = enabledLanguages
            .Where(_registry.HasLanguage)
            .Distinct()
            .ToList();

        if (langs.Count < 2)
            return new ConversionResult(text, false, null, []);

        var candidates = new List<ScoredCandidate>(langs.Count * langs.Count);

        // Native (no swap) candidates — keep input as-is, score under each language.
        foreach (var lang in langs)
        {
            var score = _registry.GetModel(lang).Score(text);
            candidates.Add(new ScoredCandidate(text, lang, lang, score));
        }

        // Swap candidates — convert from layout(li) to layout(lj), score under language(lj).
        foreach (var from in langs)
        {
            foreach (var to in langs)
            {
                if (from == to) continue;
                var fromL = _registry.GetLayout(from);
                var toL = _registry.GetLayout(to);
                var converted = LayoutConverter.Convert(text, fromL, toL);
                if (converted == text) continue;
                var score = _registry.GetModel(to).Score(converted);
                candidates.Add(new ScoredCandidate(converted, from, to, score));
            }
        }

        var ordered = candidates.OrderByDescending(c => c.Score).ToList();
        var best = ordered[0];
        var alternatives = ordered.Skip(1).Take(3).ToList();

        bool swapped = best.From != best.To;
        DetectedDirection? detected = swapped ? new DetectedDirection(best.From, best.To) : null;
        return new ConversionResult(best.Text, swapped, detected, alternatives);
    }
}
