using System.Globalization;
using Microsoft.EntityFrameworkCore;
using Tab.Application.Abstractions;
using Tab.Cli.IO;
using Tab.Domain.Entities;

namespace Tab.Cli.Services.Export;

public sealed class LoanExporter : IDataExporter<Loan>
{
    private readonly ITabDbContext _db;
    private readonly ICsvWriter _csv;

    public LoanExporter(ITabDbContext db, ICsvWriter csv)
    {
        _db = db;
        _csv = csv;
    }

    public async Task<int> ExportAsync(string userEmail, FileInfo file, CancellationToken cancellationToken)
    {
        var user = await ExportUserResolver.ResolveAsync(_db, userEmail, cancellationToken);
        var loans = await _db.Loans
            .Where(l => l.UserId == user.Id)
            .OrderBy(l => l.Date)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        var headers = new[] { "date", "amount", "description", "method", "note" };
        var rows = loans.Select(l => (IReadOnlyList<string?>)new[]
        {
            l.Date.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
            l.Amount.ToString("0.00", CultureInfo.InvariantCulture),
            l.Description,
            l.Method,
            l.Note
        });
        _csv.Write(file, headers, rows);
        return loans.Count;
    }
}
