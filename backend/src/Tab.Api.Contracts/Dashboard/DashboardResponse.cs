using Tab.Api.Contracts.Balance;
using Tab.Api.Contracts.Bills;
using Tab.Api.Contracts.Ledger;

namespace Tab.Api.Contracts.Dashboard;

public class DashboardResponse
{
    public BalanceResponse Balance { get; set; } = new();
    public IReadOnlyList<LedgerEntryResponse> RecentActivity { get; set; } = Array.Empty<LedgerEntryResponse>();
    public MonthlySummary MonthlySummary { get; set; } = new();
    public BillResponse? UpcomingBill { get; set; }
}
