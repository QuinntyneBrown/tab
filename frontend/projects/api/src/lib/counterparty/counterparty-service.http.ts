import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../common/api-base-url.token';
import { createQuery } from '../common/create-query';
import { QueryResult } from '../common/query-result.interface';
import { Counterparty } from './counterparty.interface';
import { ICounterpartyService } from './counterparty-service.interface';
import { UpdateCounterpartyRequest } from './update-counterparty-request.interface';

@Injectable()
export class CounterpartyServiceHttp implements ICounterpartyService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  get(): QueryResult<Counterparty> {
    return createQuery(() => this.http.get<Counterparty>(`${this.baseUrl}/counterparty`));
  }

  update(request: UpdateCounterpartyRequest): Promise<Counterparty> {
    return firstValueFrom(
      this.http.put<Counterparty>(`${this.baseUrl}/counterparty`, request),
    );
  }
}
