import { QueryResult } from '../common/query-result.interface';
import { CreateLoanRequest } from './create-loan-request.interface';
import { LedgerEntry } from './ledger-entry.interface';
import { LedgerQuery } from './ledger-query.interface';
import { Loan } from './loan.interface';
import { UpdateLoanRequest } from './update-loan-request.interface';

/**
 * Backs the `/loans` resource family. `list` returns the unified ledger
 * (loans + bill-splits + payments-in) because the URL is `/loans?type=...`
 * per L2-049. `get`, `create`, `update`, `delete` operate on loan rows only.
 */
export interface ILoansService {
  list(query?: LedgerQuery): QueryResult<readonly LedgerEntry[]>;
  get(id: string): QueryResult<Loan>;
  create(request: CreateLoanRequest): Promise<Loan>;
  update(id: string, request: UpdateLoanRequest): Promise<Loan>;
  delete(id: string): Promise<void>;
}
