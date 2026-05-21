using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Tab.Domain.Entities;

namespace Tab.Infrastructure.Persistence.Configurations;

public class LoanConfiguration : IEntityTypeConfiguration<Loan>
{
    public void Configure(EntityTypeBuilder<Loan> b)
    {
        b.ToTable("Loans");
        b.HasKey(x => x.Id);
        b.Property(x => x.UserId).IsRequired();
        b.Property(x => x.CounterpartyId).IsRequired();
        b.Property(x => x.Amount).HasPrecision(18, 2).IsRequired();
        b.Property(x => x.Date).IsRequired();
        b.Property(x => x.Description).IsRequired().HasMaxLength(280);
        b.Property(x => x.Method).HasMaxLength(40);
        b.Property(x => x.Note).HasMaxLength(280);
        b.Property(x => x.CreatedUtc).IsRequired();
        b.HasIndex(x => new { x.UserId, x.Date }).IsDescending(false, true);
        b.HasOne<User>().WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        b.HasOne<Counterparty>().WithMany().HasForeignKey(x => x.CounterpartyId).OnDelete(DeleteBehavior.Restrict);
    }
}
