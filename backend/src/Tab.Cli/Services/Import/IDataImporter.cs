namespace Tab.Cli.Services.Import;

public interface IDataImporter<T> where T : class
{
    Task<int> ImportAsync(string userEmail, FileInfo file, CancellationToken cancellationToken);
}
