import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_BASE_URL } from '../common/api-base-url.token';
import { createQuery } from '../common/create-query';
import { QueryResult } from '../common/query-result.interface';
import { DashboardPayload } from './dashboard-payload.interface';
import { IDashboardService } from './dashboard-service.interface';

@Injectable()
export class DashboardServiceHttp implements IDashboardService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  get(): QueryResult<DashboardPayload> {
    return createQuery(() => this.http.get<DashboardPayload>(`${this.baseUrl}/dashboard`));
  }
}
