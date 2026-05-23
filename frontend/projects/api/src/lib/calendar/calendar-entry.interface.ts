import { CalendarEntryType } from './calendar-entry-type.type';

export interface CalendarEntry {
  readonly id: string;
  readonly type: CalendarEntryType;
  readonly date: string;
  readonly description: string;
  readonly amount: number;
  /**
   * Vendor for `bill` entries (e.g. "Bell"), method for `loan`/`payment`
   * entries (e.g. "Cash"). Empty when the entry lacks it.
   */
  readonly meta: string;
  /** Split percent (1–99) for `bill` entries; 0 for others. */
  readonly splitPercent: number;
}
