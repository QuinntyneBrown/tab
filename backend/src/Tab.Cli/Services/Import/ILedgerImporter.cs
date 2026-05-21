namespace Tab.Cli.Services.Import;

public interface ILedgerImporter
{
    Task<LedgerImportResult> ImportAsync(string userEmail, FileInfo file, CancellationToken cancellationToken);
}
