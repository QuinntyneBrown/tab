using MediatR;
using Tab.Api.Contracts.Dashboard;

namespace Tab.Application.Dashboard;

public record GetDashboardQuery : IRequest<DashboardResponse>;
