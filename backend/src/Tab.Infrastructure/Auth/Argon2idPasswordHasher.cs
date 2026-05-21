using System.Security.Cryptography;
using System.Text;
using Konscious.Security.Cryptography;
using Microsoft.Extensions.Options;
using Tab.Application.Abstractions;

namespace Tab.Infrastructure.Auth;

public class Argon2idPasswordHasher : IPasswordHasher
{
    private readonly PasswordHashingOptions _options;

    public Argon2idPasswordHasher(IOptions<PasswordHashingOptions> options)
    {
        _options = options.Value;
    }

    public string Hash(string password)
    {
        ArgumentException.ThrowIfNullOrEmpty(password);
        var salt = RandomNumberGenerator.GetBytes(_options.SaltBytes);
        var hash = ComputeHash(password, salt, _options.MemoryKb, _options.Iterations, _options.Lanes, _options.HashBytes);
        return Encode(_options.MemoryKb, _options.Iterations, _options.Lanes, salt, hash);
    }

    public bool Verify(string password, string storedHash)
    {
        if (string.IsNullOrEmpty(password) || string.IsNullOrEmpty(storedHash))
        {
            return false;
        }
        if (!TryDecode(storedHash, out int memoryKb, out int iterations, out int lanes, out byte[] salt, out byte[] expected))
        {
            return false;
        }
        var actual = ComputeHash(password, salt, memoryKb, iterations, lanes, expected.Length);
        return CryptographicOperations.FixedTimeEquals(actual, expected);
    }

    private static byte[] ComputeHash(string password, byte[] salt, int memoryKb, int iterations, int lanes, int hashLength)
    {
        using var argon = new Argon2id(Encoding.UTF8.GetBytes(password))
        {
            Salt = salt,
            DegreeOfParallelism = lanes,
            MemorySize = memoryKb,
            Iterations = iterations
        };
        return argon.GetBytes(hashLength);
    }

    private static string Encode(int memoryKb, int iterations, int lanes, byte[] salt, byte[] hash)
        => $"argon2id$v=19$m={memoryKb},t={iterations},p={lanes}${Convert.ToBase64String(salt)}${Convert.ToBase64String(hash)}";

    private static bool TryDecode(string encoded, out int memoryKb, out int iterations, out int lanes, out byte[] salt, out byte[] hash)
    {
        memoryKb = iterations = lanes = 0;
        salt = Array.Empty<byte>();
        hash = Array.Empty<byte>();

        var parts = encoded.Split('$');
        if (parts.Length != 5 || parts[0] != "argon2id" || parts[1] != "v=19")
        {
            return false;
        }
        foreach (var token in parts[2].Split(','))
        {
            var kv = token.Split('=');
            if (kv.Length != 2) return false;
            if (!int.TryParse(kv[1], out int value)) return false;
            switch (kv[0])
            {
                case "m": memoryKb = value; break;
                case "t": iterations = value; break;
                case "p": lanes = value; break;
                default: return false;
            }
        }
        try
        {
            salt = Convert.FromBase64String(parts[3]);
            hash = Convert.FromBase64String(parts[4]);
        }
        catch (FormatException)
        {
            return false;
        }
        return memoryKb > 0 && iterations > 0 && lanes > 0 && salt.Length > 0 && hash.Length > 0;
    }
}
