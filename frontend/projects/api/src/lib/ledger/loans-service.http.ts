import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../common/api-base-url.token';
import { createQuery } from '../common/create-query';
import { QueryResult } from '../common/query-result.interface';
import { CreateLoanRequest } from './create-loan-request.interface';
import { LedgerEntry } from './ledger-entry.interface';
import { LedgerQuery } from './ledger-query.interface';
import { Loan } from './loan.interface';
import { ILoansService } from './loans-service.interface';
import { UpdateLoanRequest } from './update-loan-request.interface';

@Injectable()
export class LoansServiceHttp implements ILoansService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(query: LedgerQuery = {}): QueryResult<readonly LedgerEntry[]> {
    let params = new HttpParams();
    if (query.month) params = params.set('month', query.month);
    if (query.type) params = params.set('type', query.type);
    return createQuery(() =>
      this.http.get<readonly LedgerEntry[]>(`${this.baseUrl}/loans`, { params }),
    );
  }

  get(id: string): QueryResult<Loan> {
    return createQuery(() => this.http.get<Loan>(`${this.baseUrl}/loans/${id}`));
  }

  create(request: CreateLoanRequest): Promise<Loan> {
    return firstValueFrom(this.http.post<Loan>(`${this.baseUrl}/loans`, request));
  }

  update(id: string, request: UpdateLoanRequest): Promise<Loan> {
    return firstValueFrom(this.http.put<Loan>(`${this.baseUrl}/loans/${id}`, request));
  }

  delete(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.baseUrl}/loans/${id}`));
  }
}
