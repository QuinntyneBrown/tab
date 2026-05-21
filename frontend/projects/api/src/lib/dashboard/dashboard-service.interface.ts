import { QueryResult } from '../common/query-result.interface';
import { DashboardPayload } from './dashboard-payload.interface';

export interface IDashboardService {
  get(): QueryResult<DashboardPayload>;
}
