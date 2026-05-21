namespace Tab.Cli.IO;

public interface IJsonFileSerializer
{
    T Read<T>(FileInfo file);
    void Write<T>(FileInfo file, T value);
}
