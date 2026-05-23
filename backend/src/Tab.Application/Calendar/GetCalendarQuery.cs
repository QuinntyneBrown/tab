using MediatR;
using Tab.Api.Contracts.Calendar;

namespace Tab.Application.Calendar;

public class GetCalendarQuery : IRequest<CalendarResponse>
{
    public DateOnly? From { get; set; }
    public DateOnly? To { get; set; }
}
