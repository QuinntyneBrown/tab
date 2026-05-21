import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_BASE_URL } from '../common/api-base-url.token';
import { createQuery } from '../common/create-query';
import { QueryResult } from '../common/query-result.interface';
import { Balance } from './balance.interface';
import { IBalanceService } from './balance-service.interface';

@Injectable()
export class BalanceServiceHttp implements IBalanceService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  get(): QueryResult<Balance> {
    return createQuery(() => this.http.get<Balance>(`${this.baseUrl}/balance`));
  }
}
