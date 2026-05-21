using Microsoft.EntityFrameworkCore;
using Tab.Domain.Entities;

namespace Tab.Application.Abstractions;

public interface ITabDbContext
{
    DbSet<User> Users { get; }
    DbSet<Counterparty> Counterparties { get; }
    DbSet<Loan> Loans { get; }
    DbSet<RecurringBill> RecurringBills { get; }
    DbSet<BillPosting> BillPostings { get; }
    DbSet<PaymentIn> Payments { get; }
    DbSet<Preferences> Preferences { get; }
    DbSet<RefreshToken> RefreshTokens { get; }
    DbSet<StatementShare> StatementShares { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
