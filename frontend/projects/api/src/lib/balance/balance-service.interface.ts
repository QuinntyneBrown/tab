import { QueryResult } from '../common/query-result.interface';
import { Balance } from './balance.interface';

export interface IBalanceService {
  get(): QueryResult<Balance>;
}
