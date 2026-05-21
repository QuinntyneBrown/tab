namespace Tab.Cli.Services.Export;

public interface ILedgerExporter
{
    Task<LedgerExportResult> ExportAsync(string userEmail, FileInfo file, CancellationToken cancellationToken);
}
