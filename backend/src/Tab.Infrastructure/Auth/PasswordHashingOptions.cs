namespace Tab.Infrastructure.Auth;

public class PasswordHashingOptions
{
    public const string SectionName = "PasswordHashing";
    public int MemoryKb { get; set; } = 65536;
    public int Iterations { get; set; } = 4;
    public int Lanes { get; set; } = 2;
    public int HashBytes { get; set; } = 32;
    public int SaltBytes { get; set; } = 16;
}
