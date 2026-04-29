namespace Switcher.Core;

public sealed class Layout
{
    public string Id { get; }
    public string Name { get; }
    public string Language { get; }
    public string Normal { get; }
    public string Shift { get; }
    public IReadOnlyDictionary<char, int> NormalIndex { get; }
    public IReadOnlyDictionary<char, int> ShiftIndex { get; }
    public IReadOnlySet<char> Alphabet { get; }

    public Layout(string id, string name, string language, string normal, string shift)
    {
        if (normal.Length != shift.Length)
            throw new ArgumentException($"Layout '{id}': normal ({normal.Length}) and shift ({shift.Length}) must have equal length.");

        Id = id;
        Name = name;
        Language = language;
        Normal = normal;
        Shift = shift;
        NormalIndex = BuildIndex(normal);
        ShiftIndex = BuildIndex(shift);

        var alphabet = new HashSet<char>();
        foreach (var c in normal) if (char.IsLetter(c)) alphabet.Add(char.ToLowerInvariant(c));
        foreach (var c in shift)  if (char.IsLetter(c)) alphabet.Add(char.ToLowerInvariant(c));
        Alphabet = alphabet;
    }

    private static Dictionary<char, int> BuildIndex(string s)
    {
        var dict = new Dictionary<char, int>(s.Length);
        for (int i = 0; i < s.Length; i++)
            dict.TryAdd(s[i], i);
        return dict;
    }
}
