using Microsoft.EntityFrameworkCore;
using Tab.Application.Abstractions;
using Tab.Domain.Entities;

namespace Tab.Infrastructure.Persistence;

public class TabDbContext : DbContext, ITabDbContext
{
    public TabDbContext(DbContextOptions<TabDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Counterparty> Counterparties => Set<Counterparty>();
    public DbSet<Loan> Loans => Set<Loan>();
    public DbSet<RecurringBill> RecurringBills => Set<RecurringBill>();
    public DbSet<BillPosting> BillPostings => Set<BillPosting>();
    public DbSet<PaymentIn> Payments => Set<PaymentIn>();
    public DbSet<Preferences> Preferences => Set<Preferences>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<StatementShare> StatementShares => Set<StatementShare>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(TabDbContext).Assembly);
    }
}
