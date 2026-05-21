namespace Tab.Application.Bills;

public static class BillMath
{
    public static decimal ComputeShare(decimal total, int splitPercent)
    {
        var share = total * splitPercent / 100m;
        return Math.Round(share, 2, MidpointRounding.AwayFromZero);
    }

    public static DateOnly ComputeNextDueDate(int dueDay, DateOnly today)
    {
        var clamped = Math.Min(dueDay, DateTime.DaysInMonth(today.Year, today.Month));
        var candidate = new DateOnly(today.Year, today.Month, clamped);
        if (candidate >= today)
        {
            return candidate;
        }
        var next = today.AddMonths(1);
        var clampedNext = Math.Min(dueDay, DateTime.DaysInMonth(next.Year, next.Month));
        return new DateOnly(next.Year, next.Month, clampedNext);
    }
}
