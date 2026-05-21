import { StatementEntry } from './statement-entry.interface';
import { StatementTotals } from './statement-totals.interface';

export interface Statement {
  readonly from: string;
  readonly to: string;
  readonly currency: string;
  readonly counterpartyName: string;
  readonly entries: readonly StatementEntry[];
  readonly totals: StatementTotals;
}
