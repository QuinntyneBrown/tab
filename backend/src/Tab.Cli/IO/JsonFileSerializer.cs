using System.Text.Json;

namespace Tab.Cli.IO;

public sealed class JsonFileSerializer : IJsonFileSerializer
{
    private static readonly JsonSerializerOptions Options = new()
    {
        WriteIndented = true,
        PropertyNameCaseInsensitive = true
    };

    public T Read<T>(FileInfo file)
    {
        if (!file.Exists) throw new FileNotFoundException($"JSON file not found: {file.FullName}");
        using var stream = file.OpenRead();
        var value = JsonSerializer.Deserialize<T>(stream, Options)
            ?? throw new InvalidDataException($"Failed to deserialize {typeof(T).Name} from {file.FullName}.");
        return value;
    }

    public void Write<T>(FileInfo file, T value)
    {
        file.Directory?.Create();
        using var stream = file.Create();
        JsonSerializer.Serialize(stream, value, Options);
    }
}
