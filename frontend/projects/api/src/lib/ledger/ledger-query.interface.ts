import { LedgerEntryType } from './ledger-entry-type.type';

export interface LedgerQuery {
  /** ISO `YYYY-MM` month filter. Omit to retrieve all months. */
  readonly month?: string;
  readonly type?: LedgerEntryType;
}
