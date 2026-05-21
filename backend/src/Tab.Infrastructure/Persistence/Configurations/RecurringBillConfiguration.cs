using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Tab.Domain.Entities;

namespace Tab.Infrastructure.Persistence.Configurations;

public class RecurringBillConfiguration : IEntityTypeConfiguration<RecurringBill>
{
    public void Configure(EntityTypeBuilder<RecurringBill> b)
    {
        b.ToTable("RecurringBills");
        b.HasKey(x => x.Id);
        b.Property(x => x.UserId).IsRequired();
        b.Property(x => x.CounterpartyId).IsRequired();
        b.Property(x => x.Name).IsRequired().HasMaxLength(120);
        b.Property(x => x.Vendor).HasMaxLength(120);
        b.Property(x => x.ExpectedAmount).HasPrecision(18, 2).IsRequired();
        b.Property(x => x.DueDay).IsRequired();
        b.Property(x => x.SplitPercent).IsRequired();
        b.Property(x => x.CreatedUtc).IsRequired();
        b.HasIndex(x => new { x.UserId, x.ArchivedUtc });
        b.HasOne<User>().WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        b.HasOne<Counterparty>().WithMany().HasForeignKey(x => x.CounterpartyId).OnDelete(DeleteBehavior.Restrict);
    }
}
