using System.Text;

namespace Tab.Cli.IO;

public sealed class CsvWriter : ICsvWriter
{
    public void Write(FileInfo file, IReadOnlyList<string> headers, IEnumerable<IReadOnlyList<string?>> rows)
    {
        file.Directory?.Create();
        using var writer = new StreamWriter(file.FullName, append: false, new UTF8Encoding(encoderShouldEmitUTF8Identifier: false));
        writer.WriteLine(string.Join(",", headers.Select(Escape)));
        foreach (var row in rows)
        {
            writer.WriteLine(string.Join(",", row.Select(Escape)));
        }
    }

    private static string Escape(string? value)
    {
        var s = value ?? string.Empty;
        if (s.IndexOfAny(new[] { ',', '"', '\r', '\n' }) >= 0)
        {
            return "\"" + s.Replace("\"", "\"\"") + "\"";
        }
        return s;
    }
}
