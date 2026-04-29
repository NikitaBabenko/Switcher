namespace Switcher.Core;

public sealed class LanguageModel
{
    public string Language { get; }
    private readonly IReadOnlySet<char> _alphabet;
    private readonly Dictionary<string, double> _logProb;
    private readonly double _floorLogProb;

    public LanguageModel(string language, IReadOnlySet<char> alphabet, IEnumerable<string> wordlist)
    {
        Language = language;
        _alphabet = alphabet;

        var counts = new Dictionary<string, int>();
        long total = 0;

        foreach (var raw in wordlist)
        {
            var word = raw.Trim().ToLowerInvariant();
            if (word.Length == 0) continue;

            var padded = "  " + word + " ";
            for (int i = 0; i + 3 <= padded.Length; i++)
            {
                var tri = padded.Substring(i, 3);
                counts[tri] = counts.GetValueOrDefault(tri) + 1;
                total++;
            }
        }

        var vocab = Math.Max(counts.Count, 1);
        _floorLogProb = Math.Log(1.0 / (total + vocab + 1));
        _logProb = counts.ToDictionary(
            kv => kv.Key,
            kv => Math.Log((kv.Value + 1.0) / (total + vocab + 1)));
    }

    public double Score(string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return -1000;

        var lower = text.ToLowerInvariant();
        int alpha = 0, inAlphabet = 0;
        foreach (var c in lower)
        {
            if (char.IsLetter(c))
            {
                alpha++;
                if (_alphabet.Contains(c)) inAlphabet++;
            }
        }
        if (alpha == 0) return -1000;

        var alphabetRatio = (double)inAlphabet / alpha;

        var padded = "  " + lower + " ";
        double score = 0;
        int n = 0;
        int observed = 0;
        for (int i = 0; i + 3 <= padded.Length; i++)
        {
            var tri = padded.Substring(i, 3);
            bool relevant = true;
            for (int k = 0; k < 3; k++)
            {
                var ch = tri[k];
                if (ch == ' ') continue;
                if (!char.IsLetter(ch)) { relevant = false; break; }
                if (!_alphabet.Contains(ch)) { relevant = false; break; }
            }
            if (!relevant) continue;
            if (_logProb.TryGetValue(tri, out var lp))
            {
                score += lp;
                observed++;
            }
            else
            {
                score += _floorLogProb;
            }
            n++;
        }
        var trigramAvg = n > 0 ? score / n : _floorLogProb;
        var observedRatio = n > 0 ? (double)observed / n : 0;

        // Confidence bonus: longer letter runs that fit the alphabet are more decisive
        // than 1–2 char strings.
        var lengthBonus = Math.Log(1 + n) * 5;

        // Alphabet match dominates; observed-trigram ratio is the strongest signal that
        // the input is real text in this language vs. a wrong-layout artifact; length and
        // trigram quality break remaining ties.
        return alphabetRatio * 100 + observedRatio * 30 + lengthBonus + trigramAvg;
    }
}
