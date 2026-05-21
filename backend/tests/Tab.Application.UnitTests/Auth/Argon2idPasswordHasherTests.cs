// Unit Test
// Traces to: L2-002 (passcode storage)
// Description: Argon2id hasher verifies its own hashes, rejects mismatches, and salts uniquely.
using FluentAssertions;
using Microsoft.Extensions.Options;
using Tab.Infrastructure.Auth;

namespace Tab.Application.UnitTests.Auth;

public class Argon2idPasswordHasherTests
{
    private static Argon2idPasswordHasher Create() => new(Options.Create(new PasswordHashingOptions
    {
        MemoryKb = 4096,
        Iterations = 1,
        Lanes = 1
    }));

    [Fact]
    public void Hash_VerifiesCorrectPassword()
    {
        var hasher = Create();
        var hash = hasher.Hash("Correct horse battery staple!");
        hasher.Verify("Correct horse battery staple!", hash).Should().BeTrue();
    }

    [Fact]
    public void Hash_RejectsIncorrectPassword()
    {
        var hasher = Create();
        var hash = hasher.Hash("Correct horse battery staple!");
        hasher.Verify("wrong", hash).Should().BeFalse();
    }

    [Fact]
    public void Hash_SaltsDistinctly()
    {
        var hasher = Create();
        var a = hasher.Hash("same-password");
        var b = hasher.Hash("same-password");
        a.Should().NotBe(b);
    }

    [Fact]
    public void Verify_GarbledHash_ReturnsFalse()
    {
        var hasher = Create();
        hasher.Verify("anything", "not-a-real-hash").Should().BeFalse();
    }
}
