export type CalendarChipKind = 'loan' | 'bill' | 'payment' | 'projected';

/**
 * A single chip rendered inside a calendar cell. The page builds these by
 * merging posted `CalendarEntry`s and `CalendarProjection`s from the api lib.
 * `kind` drives the visual treatment and the activation behaviour.
 */
export interface CalendarChip {
  readonly id: string;
  readonly kind: CalendarChipKind;
  readonly amount: number;
  readonly title: string;
  readonly tooltip: string;
  readonly ariaLabel: string;
}
