using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Tab.Domain.Entities;

namespace Tab.Infrastructure.Persistence.Configurations;

public class PreferencesConfiguration : IEntityTypeConfiguration<Preferences>
{
    public void Configure(EntityTypeBuilder<Preferences> b)
    {
        b.ToTable("Preferences");
        b.HasKey(x => x.UserId);
        b.Property(x => x.CurrencyCode).IsRequired().HasMaxLength(3);
        b.Property(x => x.DefaultSplitPercent).IsRequired();
        b.Property(x => x.ReminderDays).IsRequired();
        b.Property(x => x.StatementTone).IsRequired().HasMaxLength(20);
        b.Property(x => x.UpdatedUtc).IsRequired();
        b.HasOne<User>().WithOne().HasForeignKey<Preferences>(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
    }
}
