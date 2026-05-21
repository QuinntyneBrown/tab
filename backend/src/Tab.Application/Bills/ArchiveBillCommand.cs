using MediatR;

namespace Tab.Application.Bills;

public record ArchiveBillCommand(Guid Id) : IRequest<Unit>;
