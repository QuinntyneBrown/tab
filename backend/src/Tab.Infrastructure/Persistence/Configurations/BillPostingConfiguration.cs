using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Tab.Domain.Entities;

namespace Tab.Infrastructure.Persistence.Configurations;

public class BillPostingConfiguration : IEntityTypeConfiguration<BillPosting>
{
    public void Configure(EntityTypeBuilder<BillPosting> b)
    {
        b.ToTable("BillPostings");
        b.HasKey(x => x.Id);
        b.Property(x => x.UserId).IsRequired();
        b.Property(x => x.CounterpartyId).IsRequired();
        b.Property(x => x.RecurringBillId).IsRequired();
        b.Property(x => x.Period).IsRequired().HasMaxLength(7);
        b.Property(x => x.TotalAmount).HasPrecision(18, 2).IsRequired();
        b.Property(x => x.ShareAmount).HasPrecision(18, 2).IsRequired();
        b.Property(x => x.Date).IsRequired();
        b.Property(x => x.CreatedUtc).IsRequired();
        b.HasIndex(x => new { x.UserId, x.Date }).IsDescending(false, true);
        b.HasIndex(x => new { x.RecurringBillId, x.Period }).IsUnique();
        b.HasOne<User>().WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        b.HasOne<Counterparty>().WithMany().HasForeignKey(x => x.CounterpartyId).OnDelete(DeleteBehavior.Restrict);
        b.HasOne<RecurringBill>().WithMany().HasForeignKey(x => x.RecurringBillId).OnDelete(DeleteBehavior.Restrict);
    }
}
