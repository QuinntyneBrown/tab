namespace Tab.Cli.IO;

public interface ICsvReader
{
    IReadOnlyList<IReadOnlyDictionary<string, string>> Read(FileInfo file);
}
