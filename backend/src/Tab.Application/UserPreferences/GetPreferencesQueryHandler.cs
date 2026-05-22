using MediatR;
using Microsoft.EntityFrameworkCore;
using Tab.Api.Contracts.UserPreferences;
using Tab.Application.Abstractions;
using Tab.Application.Auth;

namespace Tab.Application.UserPreferences;

public class GetPreferencesQueryHandler : IRequestHandler<GetPreferencesQuery, PreferencesResponse>
{
    private readonly ITabDbContext _db;
    private readonly ICurrentUser _user;

    public GetPreferencesQueryHandler(ITabDbContext db, ICurrentUser user)
    {
        _db = db;
        _user = user;
    }

    public async Task<PreferencesResponse> Handle(GetPreferencesQuery request, CancellationToken cancellationToken)
    {
        var p = await _db.Preferences.AsNoTracking().FirstOrDefaultAsync(p => p.UserId == _user.Id, cancellationToken)
            ?? throw new NotFoundException("Preferences not found.");
        return new PreferencesResponse
        {
            CurrencyCode = p.CurrencyCode,
            DefaultSplitPercent = p.DefaultSplitPercent,
            ReminderDays = p.ReminderDays
        };
    }
}
