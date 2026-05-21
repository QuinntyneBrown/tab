/**
 * Authoritative outstanding-balance figure (L2-017). Computed server-side as
 * `sum(loans) + sum(bill-split postings) − sum(payments-in)`.
 */
export interface Balance {
  readonly amount: number;
  readonly currency: string;
  readonly asOf: string;
}
