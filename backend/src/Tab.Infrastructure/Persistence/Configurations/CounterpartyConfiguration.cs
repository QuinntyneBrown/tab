using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Tab.Domain.Entities;

namespace Tab.Infrastructure.Persistence.Configurations;

public class CounterpartyConfiguration : IEntityTypeConfiguration<Counterparty>
{
    public void Configure(EntityTypeBuilder<Counterparty> b)
    {
        b.ToTable("Counterparties");
        b.HasKey(x => x.Id);
        b.Property(x => x.Name).IsRequired().HasMaxLength(80);
        b.Property(x => x.Note).HasMaxLength(280);
        b.Property(x => x.CreatedUtc).IsRequired();
        b.HasIndex(x => x.UserId).IsUnique();
        b.HasOne<User>()
            .WithOne()
            .HasForeignKey<Counterparty>(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
