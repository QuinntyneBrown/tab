using MediatR;
using Tab.Api.Contracts.UserPreferences;

namespace Tab.Application.UserPreferences;

public record GetPreferencesQuery : IRequest<PreferencesResponse>;
