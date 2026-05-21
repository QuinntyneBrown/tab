using FluentValidation;

namespace Tab.Application.Bills;

public class CreateBillPostingCommandValidator : AbstractValidator<CreateBillPostingCommand>
{
    public CreateBillPostingCommandValidator()
    {
        RuleFor(x => x.Period)
            .NotEmpty()
            .Matches("^[0-9]{4}-(0[1-9]|1[0-2])$").WithMessage("Period must be in YYYY-MM format");
        RuleFor(x => x.ActualTotal).GreaterThan(0).When(x => x.ActualTotal.HasValue);
    }
}
