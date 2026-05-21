import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_BASE_URL } from '../common/api-base-url.token';
import { createQuery } from '../common/create-query';
import { QueryResult } from '../common/query-result.interface';
import { CurrentUser } from './current-user.interface';
import { IMeService } from './me-service.interface';

@Injectable()
export class MeServiceHttp implements IMeService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  me(): QueryResult<CurrentUser> {
    return createQuery(() => this.http.get<CurrentUser>(`${this.baseUrl}/me`));
  }
}
