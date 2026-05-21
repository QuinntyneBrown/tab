namespace Tab.Cli.Services.Export;

public interface IDataExporter<T> where T : class
{
    Task<int> ExportAsync(string userEmail, FileInfo file, CancellationToken cancellationToken);
}
