using FluentValidation;

namespace Tab.Application.Loans;

public class CreateLoanCommandValidator : AbstractValidator<CreateLoanCommand>
{
    public CreateLoanCommandValidator(TimeProvider timeProvider)
    {
        RuleFor(x => x.Amount).GreaterThan(0).WithMessage("must be greater than 0");
        RuleFor(x => x.Description).NotEmpty().MaximumLength(280);
        RuleFor(x => x.Method).MaximumLength(40);
        RuleFor(x => x.Note).MaximumLength(280);
        RuleFor(x => x.Date)
            .LessThanOrEqualTo(_ => DateOnly.FromDateTime(timeProvider.GetUtcNow().UtcDateTime))
            .WithMessage("Date cannot be in the future");
    }
}
