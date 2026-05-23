namespace Tab.Api.Contracts.Calendar;

public class CalendarProjection
{
    public Guid BillId { get; set; }
    public DateOnly Date { get; set; }
    public string BillName { get; set; } = string.Empty;
    public decimal ExpectedAmount { get; set; }
    public decimal CounterpartyShare { get; set; }
}
