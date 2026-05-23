using FluentValidation;

namespace Tab.Application.Calendar;

public class GetCalendarQueryValidator : AbstractValidator<GetCalendarQuery>
{
    public const int MaxRangeDays = 366;

    public GetCalendarQueryValidator()
    {
        RuleFor(x => x.From).NotNull().WithMessage("from is required");
        RuleFor(x => x.To).NotNull().WithMessage("to is required");
        RuleFor(x => x).Must(HaveValidRange)
            .When(x => x.From.HasValue && x.To.HasValue)
            .WithMessage(q => RangeMessage(q.From!.Value, q.To!.Value));
    }

    private static bool HaveValidRange(GetCalendarQuery q)
    {
        var from = q.From!.Value;
        var to = q.To!.Value;
        if (to < from) return false;
        return (to.DayNumber - from.DayNumber) <= MaxRangeDays - 1;
    }

    private static string RangeMessage(DateOnly from, DateOnly to)
    {
        if (to < from) return "to must be on or after from";
        return $"Range exceeds maximum of {MaxRangeDays} days";
    }
}
