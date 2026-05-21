import { LedgerEntryType } from '../ledger/ledger-entry-type.type';

export interface StatementEntry {
  readonly id: string;
  readonly date: string;
  readonly description: string;
  readonly type: LedgerEntryType;
  readonly totalAmount?: number;
  readonly counterpartyShare: number;
  readonly runningBalance: number;
}
