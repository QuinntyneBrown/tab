/**
 * The dashboard nudge for the nearest upcoming bill within the user's
 * reminder lead time (L2-018 AC2/AC3). The payload omits this field when no
 * bill falls within the window.
 */
export interface DashboardNudge {
  readonly billId: string;
  readonly billName: string;
  readonly dueDate: string;
  readonly daysUntilDue: number;
  readonly expectedShare: number;
}
