using Microsoft.EntityFrameworkCore;
using Tab.Api.Contracts.Statement;
using Tab.Application.Abstractions;

namespace Tab.Application.Statement;

internal static class StatementBuilder
{
    public static async Task<StatementResponse> BuildAsync(
        ITabDbContext db,
        Guid userId,
        DateOnly from,
        DateOnly to,
        CancellationToken ct)
    {
        var loans = await db.Loans.AsNoTracking()
            .Where(l => l.UserId == userId && l.Date >= from && l.Date <= to)
            .ToListAsync(ct);
        var bills = await db.BillPostings.AsNoTracking()
            .Where(b => b.UserId == userId && b.Date >= from && b.Date <= to)
            .ToListAsync(ct);
        var billNames = await db.RecurringBills.AsNoTracking()
            .Where(b => b.UserId == userId)
            .ToDictionaryAsync(b => b.Id, b => b.Name, ct);
        var payments = await db.Payments.AsNoTracking()
            .Where(p => p.UserId == userId && p.Date >= from && p.Date <= to)
            .ToListAsync(ct);

        var lines = new List<StatementLine>(loans.Count + bills.Count + payments.Count);
        foreach (var l in loans)
        {
            lines.Add(new StatementLine { Date = l.Date, Type = "loan", Description = l.Description, Amount = l.Amount });
        }
        foreach (var b in bills)
        {
            lines.Add(new StatementLine
            {
                Date = b.Date,
                Type = "bill",
                Description = $"{(billNames.TryGetValue(b.RecurringBillId, out var n) ? n : "Bill")} ({b.Period})",
                TotalAmount = b.TotalAmount,
                Amount = b.ShareAmount
            });
        }
        foreach (var p in payments)
        {
            lines.Add(new StatementLine { Date = p.Date, Type = "payment", Description = "Payment received", Amount = p.Amount });
        }

        lines = lines.OrderBy(x => x.Date).ToList();

        decimal running = 0m;
        foreach (var line in lines)
        {
            running = line.Type == "payment" ? running - line.Amount : running + line.Amount;
            line.RunningBalance = running;
        }

        var loansTotal = loans.Sum(l => l.Amount);
        var billsTotal = bills.Sum(b => b.ShareAmount);
        var paymentsTotal = payments.Sum(p => p.Amount);

        return new StatementResponse
        {
            From = from,
            To = to,
            Lines = lines,
            LoansTotal = loansTotal,
            BillsTotal = billsTotal,
            PaymentsTotal = paymentsTotal,
            BalanceOwing = loansTotal + billsTotal - paymentsTotal
        };
    }

    public static async Task<DateOnly> ResolveFromAsync(ITabDbContext db, Guid userId, DateOnly fallback, CancellationToken ct)
    {
        var earliestLoan = await db.Loans.AsNoTracking().Where(l => l.UserId == userId).MinAsync(l => (DateOnly?)l.Date, ct);
        var earliestBill = await db.BillPostings.AsNoTracking().Where(b => b.UserId == userId).MinAsync(b => (DateOnly?)b.Date, ct);
        var earliestPayment = await db.Payments.AsNoTracking().Where(p => p.UserId == userId).MinAsync(p => (DateOnly?)p.Date, ct);

        var dates = new[] { earliestLoan, earliestBill, earliestPayment }.Where(d => d.HasValue).Select(d => d!.Value).ToList();
        if (dates.Count == 0)
        {
            return fallback;
        }
        var earliest = dates.Min();
        return new DateOnly(earliest.Year, earliest.Month, 1);
    }
}
