import { QueryResult } from '../common/query-result.interface';
import { Counterparty } from './counterparty.interface';
import { UpdateCounterpartyRequest } from './update-counterparty-request.interface';

export interface ICounterpartyService {
  get(): QueryResult<Counterparty>;
  update(request: UpdateCounterpartyRequest): Promise<Counterparty>;
}
