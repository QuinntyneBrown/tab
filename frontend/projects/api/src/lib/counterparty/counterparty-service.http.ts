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
    // Synchronous XHR so the write completes before any pending Playwright
    // navigation aborts the underlying fetch. Browsers still permit this; the
    // deprecation warning is acceptable for a mutation that must be durable
    // before the user can leave the page.
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', `${this.baseUrl}/counterparty`, false);
    xhr.setRequestHeader('Content-Type', 'application/json');
    const token = typeof window !== 'undefined' && window.localStorage
      ? window.localStorage.getItem('tab.access_token')
      : null;
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.send(JSON.stringify(request));
    if (xhr.status < 200 || xhr.status >= 300) {
      throw new Error(`counterparty update failed: ${xhr.status}`);
    }
    return Promise.resolve(JSON.parse(xhr.responseText) as Counterparty);
  }
}
