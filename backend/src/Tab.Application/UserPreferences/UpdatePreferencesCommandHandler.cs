using MediatR;
using Microsoft.EntityFrameworkCore;
using Tab.Api.Contracts.UserPreferences;
using Tab.Application.Abstractions;
using Tab.Application.Auth;

namespace Tab.Application.UserPreferences;

public class UpdatePreferencesCommandHandler : IRequestHandler<UpdatePreferencesCommand, PreferencesResponse>
{
    private readonly ITabDbContext _db;
    private readonly ICurrentUser _user;
    private readonly TimeProvider _timeProvider;

    public UpdatePreferencesCommandHandler(ITabDbContext db, ICurrentUser user, TimeProvider timeProvider)
    {
        _db = db;
        _user = user;
        _timeProvider = timeProvider;
    }

    public async Task<PreferencesResponse> Handle(UpdatePreferencesCommand request, CancellationToken cancellationToken)
    {
        var p = await _db.Preferences.FirstOrDefaultAsync(p => p.UserId == _user.Id, cancellationToken)
            ?? throw new NotFoundException("Preferences not found.");

        p.CurrencyCode = request.CurrencyCode;
        p.DefaultSplitPercent = request.DefaultSplitPercent;
        p.ReminderDays = request.ReminderDays;
        p.UpdatedUtc = _timeProvider.GetUtcNow();

        await _db.SaveChangesAsync(cancellationToken);

        return new PreferencesResponse
        {
            CurrencyCode = p.CurrencyCode,
            DefaultSplitPercent = p.DefaultSplitPercent,
            ReminderDays = p.ReminderDays
        };
    }
}
