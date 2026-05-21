/**
 * Concrete posting created when the user marks a bill paid (L2-013). The
 * `counterpartyShare` is what hits the outstanding balance; the `totalAmount`
 * is what the user actually paid the vendor.
 */
export interface BillPosting {
  readonly id: string;
  readonly billId: string;
  readonly period: string;
  readonly date: string;
  readonly totalAmount: number;
  readonly splitPercent: number;
  readonly counterpartyShare: number;
}
