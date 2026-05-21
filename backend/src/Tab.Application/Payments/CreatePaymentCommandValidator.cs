using FluentValidation;

namespace Tab.Application.Payments;

public class CreatePaymentCommandValidator : AbstractValidator<CreatePaymentCommand>
{
    public CreatePaymentCommandValidator()
    {
        RuleFor(x => x.Amount).GreaterThan(0).WithMessage("must be greater than 0");
        RuleFor(x => x.Method).MaximumLength(40);
        RuleFor(x => x.Note).MaximumLength(280);
    }
}
