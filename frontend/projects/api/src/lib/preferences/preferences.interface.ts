export interface Preferences {
  /** ISO 4217 currency code (default `CAD`, L2-021). */
  readonly currency: string;
  /** Default split percentage 1–99 (default 50). */
  readonly defaultSplitPercent: number;
  /** Reminder lead time in days, 1–14 (default 3). */
  readonly reminderLeadDays: number;
}
