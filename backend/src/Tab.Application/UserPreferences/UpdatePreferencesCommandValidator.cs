using FluentValidation;

namespace Tab.Application.UserPreferences;

public class UpdatePreferencesCommandValidator : AbstractValidator<UpdatePreferencesCommand>
{
    public UpdatePreferencesCommandValidator()
    {
        RuleFor(x => x.CurrencyCode)
            .NotEmpty()
            .Length(3)
            .Matches("^[A-Z]{3}$").WithMessage("Currency must be a 3-letter ISO 4217 code");
        RuleFor(x => x.DefaultSplitPercent).InclusiveBetween(1, 99);
        RuleFor(x => x.ReminderDays).InclusiveBetween(1, 14);
    }
}
