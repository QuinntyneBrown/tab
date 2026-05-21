namespace Tab.Cli.IO;

public interface ICsvWriter
{
    void Write(FileInfo file, IReadOnlyList<string> headers, IEnumerable<IReadOnlyList<string?>> rows);
}
