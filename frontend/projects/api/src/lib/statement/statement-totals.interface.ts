/**
 * Statement totals satisfying `loans + bills − payments = balanceOwing`
 * (L2-019 AC3). `balanceOwing` matches `GET /balance` for the same period.
 */
export interface StatementTotals {
  readonly loans: number;
  readonly bills: number;
  readonly payments: number;
  readonly balanceOwing: number;
}
