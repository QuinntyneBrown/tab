using FluentValidation;

namespace Tab.Application.Bills;

public class CreateBillCommandValidator : AbstractValidator<CreateBillCommand>
{
    public CreateBillCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(120);
        RuleFor(x => x.Vendor).MaximumLength(120);
        RuleFor(x => x.ExpectedAmount).GreaterThan(0);
        RuleFor(x => x.DueDay).InclusiveBetween(1, 28);
        RuleFor(x => x.SplitPercent).InclusiveBetween(1, 99)
            .WithMessage("Split must be between 1 and 99 percent");
    }
}
