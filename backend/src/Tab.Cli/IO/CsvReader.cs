using System.Text;

namespace Tab.Cli.IO;

public sealed class CsvReader : ICsvReader
{
    public IReadOnlyList<IReadOnlyDictionary<string, string>> Read(FileInfo file)
    {
        if (!file.Exists) throw new FileNotFoundException($"CSV file not found: {file.FullName}");

        var rows = ParseRfc4180(File.ReadAllText(file.FullName, Encoding.UTF8));
        if (rows.Count == 0) return Array.Empty<IReadOnlyDictionary<string, string>>();

        var header = rows[0];
        var result = new List<IReadOnlyDictionary<string, string>>(rows.Count - 1);
        for (int i = 1; i < rows.Count; i++)
        {
            var row = rows[i];
            if (row.Count == 1 && string.IsNullOrEmpty(row[0])) continue;
            var dict = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            for (int c = 0; c < header.Count; c++)
            {
                dict[header[c]] = c < row.Count ? row[c] : string.Empty;
            }
            result.Add(dict);
        }
        return result;
    }

    private static IReadOnlyList<IReadOnlyList<string>> ParseRfc4180(string text)
    {
        var rows = new List<IReadOnlyList<string>>();
        var current = new List<string>();
        var field = new StringBuilder();
        bool inQuotes = false;

        for (int i = 0; i < text.Length; i++)
        {
            char ch = text[i];
            if (inQuotes)
            {
                if (ch == '"')
                {
                    if (i + 1 < text.Length && text[i + 1] == '"') { field.Append('"'); i++; }
                    else inQuotes = false;
                }
                else field.Append(ch);
            }
            else
            {
                switch (ch)
                {
                    case '"': inQuotes = true; break;
                    case ',': current.Add(field.ToString()); field.Clear(); break;
                    case '\r': break;
                    case '\n': current.Add(field.ToString()); field.Clear(); rows.Add(current); current = new List<string>(); break;
                    default: field.Append(ch); break;
                }
            }
        }
        if (field.Length > 0 || current.Count > 0)
        {
            current.Add(field.ToString());
            rows.Add(current);
        }
        return rows;
    }
}
