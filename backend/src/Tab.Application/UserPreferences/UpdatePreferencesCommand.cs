using MediatR;
using Tab.Api.Contracts.UserPreferences;

namespace Tab.Application.UserPreferences;

public record UpdatePreferencesCommand(
    string CurrencyCode,
    int DefaultSplitPercent,
    int ReminderDays) : IRequest<PreferencesResponse>;
