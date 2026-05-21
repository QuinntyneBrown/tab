using System.Security.Cryptography;
using Microsoft.Extensions.Options;

namespace Tab.Infrastructure.Auth;

public sealed class RsaKeyProvider : IDisposable
{
    private readonly RSA _rsa;
    private readonly bool _generated;

    public RsaKeyProvider(IOptions<JwtOptions> options)
    {
        var pem = options.Value.RsaPrivateKeyPem;
        if (string.IsNullOrWhiteSpace(pem))
        {
            _rsa = RSA.Create(2048);
            _generated = true;
        }
        else
        {
            _rsa = RSA.Create();
            _rsa.ImportFromPem(pem);
            _generated = false;
        }
    }

    public RSA Rsa => _rsa;
    public bool GeneratedAtStartup => _generated;

    public void Dispose() => _rsa.Dispose();
}
