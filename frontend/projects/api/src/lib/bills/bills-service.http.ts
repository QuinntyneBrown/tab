import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../common/api-base-url.token';
import { createQuery } from '../common/create-query';
import { QueryResult } from '../common/query-result.interface';
import { BillPosting } from './bill-posting.interface';
import { IBillsService } from './bills-service.interface';
import { CreateRecurringBillRequest } from './create-recurring-bill-request.interface';
import { LogBillPaymentRequest } from './log-bill-payment-request.interface';
import { MarkBillPaidRequest } from './mark-bill-paid-request.interface';
import { RecurringBill } from './recurring-bill.interface';
import { UpdateRecurringBillRequest } from './update-recurring-bill-request.interface';

@Injectable()
export class BillsServiceHttp implements IBillsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(): QueryResult<readonly RecurringBill[]> {
    return createQuery(() =>
      this.http.get<readonly RecurringBill[]>(`${this.baseUrl}/bills`),
    );
  }

  create(request: CreateRecurringBillRequest): Promise<RecurringBill> {
    return firstValueFrom(this.http.post<RecurringBill>(`${this.baseUrl}/bills`, request));
  }

  update(id: string, request: UpdateRecurringBillRequest): Promise<RecurringBill> {
    return firstValueFrom(
      this.http.put<RecurringBill>(`${this.baseUrl}/bills/${id}`, request),
    );
  }

  archive(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.baseUrl}/bills/${id}`));
  }

  markPaidInFull(id: string, request: MarkBillPaidRequest): Promise<BillPosting> {
    return firstValueFrom(
      this.http.post<BillPosting>(`${this.baseUrl}/bills/${id}/postings`, {
        kind: 'full',
        ...request,
      }),
    );
  }

  logPayment(id: string, request: LogBillPaymentRequest): Promise<BillPosting> {
    return firstValueFrom(
      this.http.post<BillPosting>(`${this.baseUrl}/bills/${id}/postings`, {
        kind: 'log',
        ...request,
      }),
    );
  }
}
