using System.Text;

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

        // Pure punctuation/digits — no letter signal to base a decision on.
        // A literal `,` on EN maps to `б` on RU (different physical key on RU keyboard),
        // so without this guard the detector would treat "123!" as a wrong-layout swap
        // candidate to RU just because `!` produces a letter on the other side.
        if (!text.Any(char.IsLetter))
            return new ConversionResult(text, false, null, []);

        var langs = enabledLanguages
            .Where(_registry.HasLanguage)
            .Distinct()
            .ToList();

        if (langs.Count < 2)
            return new ConversionResult(text, false, null, []);

        var candidates = new List<ScoredCandidate>(langs.Count * langs.Count * 2);
        AddCandidates(candidates, text, langs);

        // Caps-Lock heuristic: if the user had Caps Lock on while in the wrong layout,
        // every letter has its case inverted. Try the case-flipped variant as well —
        // we only care if it scores better than the as-typed variants.
        if (HasMixedCase(text))
        {
            var flipped = InvertCase(text);
            AddCandidates(candidates, flipped, langs);
        }

        // Score is case-insensitive, so "Привет" and "пРИВЕТ" tie. Break ties by
        // naturalness of the case pattern (more lowercase = more natural prose),
        // which makes the Caps Lock heuristic actually pick the unflipped variant.
        var ordered = candidates
            .OrderByDescending(c => c.Score)
            .ThenByDescending(c => CaseNaturalness(c.Text))
            .ToList();
        var best = ordered[0];
        var alternatives = ordered.Skip(1).Take(3).ToList();

        bool swapped = best.From != best.To || best.Text != text;
        DetectedDirection? detected = best.From != best.To ? new DetectedDirection(best.From, best.To) : null;
        return new ConversionResult(best.Text, swapped, detected, alternatives);
    }

    private void AddCandidates(List<ScoredCandidate> candidates, string text, IReadOnlyList<string> langs)
    {
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
    }

    private static bool HasMixedCase(string text)
    {
        bool hasUpper = false, hasLower = false;
        foreach (var c in text)
        {
            if (char.IsUpper(c)) hasUpper = true;
            else if (char.IsLower(c)) hasLower = true;
            if (hasUpper && hasLower) return true;
        }
        return false;
    }

    // Per-word case scoring. Natural prose patterns (Title, lowercase, UPPERCASE)
    // get positive points; the "1 lower + N upper" pattern produced by Caps-Lock
    // typing scores negative — so when scores tie, the unflipped variant wins for
    // intentional emphasis ("Hello WORLD") and the flipped variant wins when the
    // input itself looks Caps-Lock-ish ("gHBDTN" / "пРИВЕТ").
    private static double CaseNaturalness(string text)
    {
        double total = 0;
        int wordUpper = 0, wordLower = 0, wordLetters = 0;
        bool firstIsUpper = false, firstSet = false;

        void Flush()
        {
            if (wordLetters == 0) return;
            if (wordUpper == 0) total += 2;                       // all lower
            else if (wordLower == 0) total += 1;                  // ALL UPPER
            else if (firstIsUpper && wordUpper == 1) total += 2;  // Title
            else if (!firstIsUpper && wordLower == 1) total -= 2; // Caps-Lock pattern
            wordUpper = wordLower = wordLetters = 0;
            firstSet = false;
        }

        foreach (var c in text)
        {
            if (char.IsLetter(c))
            {
                wordLetters++;
                if (!firstSet) { firstIsUpper = char.IsUpper(c); firstSet = true; }
                if (char.IsUpper(c)) wordUpper++;
                else if (char.IsLower(c)) wordLower++;
            }
            else
            {
                Flush();
            }
        }
        Flush();
        return total;
    }

    private static string InvertCase(string text)
    {
        var sb = new StringBuilder(text.Length);
        foreach (var c in text)
        {
            if (char.IsUpper(c)) sb.Append(char.ToLowerInvariant(c));
            else if (char.IsLower(c)) sb.Append(char.ToUpperInvariant(c));
            else sb.Append(c);
        }
        return sb.ToString();
    }
}
