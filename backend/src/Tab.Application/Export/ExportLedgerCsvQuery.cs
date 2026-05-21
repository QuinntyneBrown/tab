using MediatR;

namespace Tab.Application.Export;

public record ExportLedgerCsvQuery : IRequest<byte[]>;
