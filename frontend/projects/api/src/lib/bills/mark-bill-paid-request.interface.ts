/**
 * "Mark paid in full" body. Backend uses the bill's expected amount and split
 * percentage to compute the counterparty share.
 */
export interface MarkBillPaidRequest {
  readonly period: string;
  readonly date: string;
}
