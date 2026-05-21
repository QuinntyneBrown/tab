using MediatR;
using Tab.Api.Contracts.Statement;

namespace Tab.Application.Statement;

public record CreateStatementShareCommand(DateOnly? From, DateOnly? To) : IRequest<StatementShareResponse>;
