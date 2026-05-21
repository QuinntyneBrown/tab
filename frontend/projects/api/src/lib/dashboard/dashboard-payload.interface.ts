import { Balance } from '../balance/balance.interface';
import { Counterparty } from '../counterparty/counterparty.interface';
import { LedgerEntry } from '../ledger/ledger-entry.interface';
import { DashboardNudge } from './dashboard-nudge.interface';
import { MonthlySummary } from './monthly-summary.interface';

/**
 * Single composite payload returned by `GET /dashboard` (L2-026 AC2: one round
 * trip per logical query, no N+1). `nudge` is omitted when no bill is within
 * the reminder window (L2-018 AC3).
 */
export interface DashboardPayload {
  readonly counterparty: Counterparty;
  readonly balance: Balance;
  readonly recentActivity: readonly LedgerEntry[];
  readonly monthlySummary: MonthlySummary;
  readonly nudge?: DashboardNudge;
}
