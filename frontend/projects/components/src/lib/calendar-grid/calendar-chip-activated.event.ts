import { CalendarChip } from './calendar-chip.interface';

export interface CalendarChipActivatedEvent {
  readonly iso: string;
  readonly chip: CalendarChip;
}
