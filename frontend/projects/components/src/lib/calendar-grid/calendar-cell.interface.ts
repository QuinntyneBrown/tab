import { CalendarChip } from './calendar-chip.interface';

/**
 * Visual model for one cell in the month grid. The component does not own
 * date math itself — the page composes a `CalendarCell[]` of length 42 and
 * passes it in via the `cells` input.
 */
export interface CalendarCell {
  readonly iso: string;
  readonly day: number;
  readonly inMonth: boolean;
  readonly isToday: boolean;
  readonly chips: readonly CalendarChip[];
}
