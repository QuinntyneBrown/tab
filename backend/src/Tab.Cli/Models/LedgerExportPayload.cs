using Tab.Domain.Entities;

namespace Tab.Cli.Models;

public sealed class LedgerExportPayload
{
    public string UserEmail { get; set; } = string.Empty;
    public DateTimeOffset ExportedUtc { get; set; }
    public IReadOnlyList<Loan> Loans { get; set; } = Array.Empty<Loan>();
    public IReadOnlyList<RecurringBill> Bills { get; set; } = Array.Empty<RecurringBill>();
    public IReadOnlyList<PaymentIn> Payments { get; set; } = Array.Empty<PaymentIn>();
}
