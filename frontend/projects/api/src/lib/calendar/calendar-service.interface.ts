import { QueryResult } from '../common/query-result.interface';
import { CalendarPayload } from './calendar-payload.interface';

export interface ICalendarService {
  /**
   * Fetch the composite calendar payload (posted entries + projected bill
   * postings) for the inclusive ISO date range [from, to]. Range must be ≤ 366
   * days; the backend enforces this with a 400 Problem Details response.
   */
  get(from: string, to: string): QueryResult<CalendarPayload>;
}
