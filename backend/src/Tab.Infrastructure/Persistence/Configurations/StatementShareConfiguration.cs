using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Tab.Domain.Entities;

namespace Tab.Infrastructure.Persistence.Configurations;

public class StatementShareConfiguration : IEntityTypeConfiguration<StatementShare>
{
    public void Configure(EntityTypeBuilder<StatementShare> b)
    {
        b.ToTable("StatementShares");
        b.HasKey(x => x.Id);
        b.Property(x => x.UserId).IsRequired();
        b.Property(x => x.FromDate).IsRequired();
        b.Property(x => x.ToDate).IsRequired();
        b.Property(x => x.TokenHash).IsRequired().HasMaxLength(128);
        b.HasIndex(x => x.TokenHash).IsUnique();
        b.Property(x => x.ExpiresUtc).IsRequired();
        b.Property(x => x.CreatedUtc).IsRequired();
        b.HasOne<User>().WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
    }
}
