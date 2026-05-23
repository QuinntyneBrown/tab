import { CalendarEntry } from './calendar-entry.interface';
import { CalendarProjection } from './calendar-projection.interface';

export interface CalendarPayload {
  readonly from: string;
  readonly to: string;
  readonly entries: readonly CalendarEntry[];
  readonly projections: readonly CalendarProjection[];
}
