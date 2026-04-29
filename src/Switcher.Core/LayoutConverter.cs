using System.Text;

namespace Switcher.Core;

public static class LayoutConverter
{
    public static string Convert(string text, Layout from, Layout to)
    {
        if (string.IsNullOrEmpty(text)) return text;

        var sb = new StringBuilder(text.Length);
        foreach (var c in text)
        {
            if (from.NormalIndex.TryGetValue(c, out var i) && i < to.Normal.Length)
                sb.Append(to.Normal[i]);
            else if (from.ShiftIndex.TryGetValue(c, out var j) && j < to.Shift.Length)
                sb.Append(to.Shift[j]);
            else
                sb.Append(c);
        }
        return sb.ToString();
    }
}
