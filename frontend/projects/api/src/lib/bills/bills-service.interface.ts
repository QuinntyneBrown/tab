import { QueryResult } from '../common/query-result.interface';
import { BillPosting } from './bill-posting.interface';
import { CreateRecurringBillRequest } from './create-recurring-bill-request.interface';
import { LogBillPaymentRequest } from './log-bill-payment-request.interface';
import { MarkBillPaidRequest } from './mark-bill-paid-request.interface';
import { RecurringBill } from './recurring-bill.interface';
import { UpdateRecurringBillRequest } from './update-recurring-bill-request.interface';

export interface IBillsService {
  list(): QueryResult<readonly RecurringBill[]>;
  create(request: CreateRecurringBillRequest): Promise<RecurringBill>;
  update(id: string, request: UpdateRecurringBillRequest): Promise<RecurringBill>;
  archive(id: string): Promise<void>;
  markPaidInFull(id: string, request: MarkBillPaidRequest): Promise<BillPosting>;
  logPayment(id: string, request: LogBillPaymentRequest): Promise<BillPosting>;
}
