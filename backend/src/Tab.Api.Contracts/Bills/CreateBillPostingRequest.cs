namespace Tab.Api.Contracts.Bills;

public class CreateBillPostingRequest
{
    public string Period { get; set; } = string.Empty;
    public DateOnly? Date { get; set; }
    public decimal? ActualTotal { get; set; }
}
