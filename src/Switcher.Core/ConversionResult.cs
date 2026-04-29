namespace Switcher.Core;

public sealed record DetectedDirection(string From, string To);

public sealed record ScoredCandidate(string Text, string From, string To, double Score);

public sealed record ConversionResult(
    string Result,
    bool Swapped,
    DetectedDirection? Detected,
    IReadOnlyList<ScoredCandidate> Alternatives);
