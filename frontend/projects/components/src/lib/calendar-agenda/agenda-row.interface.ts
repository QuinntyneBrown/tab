import { CalendarChipKind } from '../calendar-grid/calendar-chip.interface';

export interface AgendaRow {
  readonly id: string;
  readonly kind: CalendarChipKind;
  readonly title: string;
  readonly amount: number;
  /** Type label rendered as a chip-style pill (e.g. "Loan", "Bill split"). */
  readonly pill: string;
  /**
   * Trailing meta text rendered next to the pill (e.g. vendor + split for
   * bills, payment method for loans / payments). Empty when not applicable.
   */
  readonly meta: string;
  readonly ariaLabel: string;
}
