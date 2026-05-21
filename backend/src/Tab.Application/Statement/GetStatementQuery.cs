using MediatR;
using Tab.Api.Contracts.Statement;

namespace Tab.Application.Statement;

public record GetStatementQuery(DateOnly? From, DateOnly? To) : IRequest<StatementResponse>;
