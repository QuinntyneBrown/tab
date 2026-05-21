using MediatR;
using Tab.Api.Contracts.Statement;

namespace Tab.Application.Statement;

public record GetSharedStatementQuery(string Token) : IRequest<StatementResponse?>;
