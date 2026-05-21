/**
 * "Log this month" body for the case where the user paid an amount that
 * differs from the expected (L2-013 AC3). The original definition is left
 * unchanged; only this posting uses `actualAmount`.
 */
export interface LogBillPaymentRequest {
  readonly period: string;
  readonly date: string;
  readonly actualAmount: number;
}
