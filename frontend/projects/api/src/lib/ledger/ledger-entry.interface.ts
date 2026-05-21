import { LedgerEntryType } from './ledger-entry-type.type';

/**
 * Unified ledger row (L1-008). Returned by `GET /loans` for any combination of
 * type filters. `totalAmount` is the full transaction; `counterpartyShare` is
 * what was posted to the outstanding balance.
 */
export interface LedgerEntry {
  readonly id: string;
  readonly type: LedgerEntryType;
  readonly date: string;
  readonly description: string;
  readonly totalAmount: number;
  readonly counterpartyShare: number;
  readonly method?: string;
  readonly note?: string;
  readonly billId?: string;
  readonly period?: string;
}
