using System.Text;

namespace Tab.Application.Export;

internal static class CsvWriter
{
    public static void AppendRow(StringBuilder sb, params string[] fields)
    {
        for (var i = 0; i < fields.Length; i++)
        {
            if (i > 0) sb.Append(',');
            sb.Append(Escape(fields[i]));
        }
        sb.Append("\r\n");
    }

    private static string Escape(string field)
    {
        if (string.IsNullOrEmpty(field))
        {
            return string.Empty;
        }
        if (field.IndexOfAny(new[] { ',', '"', '\r', '\n' }) < 0)
        {
            return field;
        }
        return "\"" + field.Replace("\"", "\"\"") + "\"";
    }
}
