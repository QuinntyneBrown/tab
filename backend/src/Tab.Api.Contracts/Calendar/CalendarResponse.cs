namespace Tab.Api.Contracts.Calendar;

public class CalendarResponse
{
    public DateOnly From { get; set; }
    public DateOnly To { get; set; }
    public IReadOnlyList<CalendarEntry> Entries { get; set; } = Array.Empty<CalendarEntry>();
    public IReadOnlyList<CalendarProjection> Projections { get; set; } = Array.Empty<CalendarProjection>();
}
