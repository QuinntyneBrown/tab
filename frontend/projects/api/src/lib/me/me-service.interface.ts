import { QueryResult } from '../common/query-result.interface';
import { CurrentUser } from './current-user.interface';

export interface IMeService {
  me(): QueryResult<CurrentUser>;
}
