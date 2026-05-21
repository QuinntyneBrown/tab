using FluentValidation;

namespace Tab.Application.Counterparties;

public class UpdateCounterpartyCommandValidator : AbstractValidator<UpdateCounterpartyCommand>
{
    public UpdateCounterpartyCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().WithMessage("Name is required").MaximumLength(80);
        RuleFor(x => x.Note).MaximumLength(280);
    }
}
