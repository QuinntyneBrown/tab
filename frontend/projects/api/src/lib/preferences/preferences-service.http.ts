import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../common/api-base-url.token';
import { createQuery } from '../common/create-query';
import { QueryResult } from '../common/query-result.interface';
import { Preferences } from './preferences.interface';
import { IPreferencesService } from './preferences-service.interface';
import { UpdatePreferencesRequest } from './update-preferences-request.interface';

@Injectable()
export class PreferencesServiceHttp implements IPreferencesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  get(): QueryResult<Preferences> {
    return createQuery(() => this.http.get<Preferences>(`${this.baseUrl}/preferences`));
  }

  update(request: UpdatePreferencesRequest): Promise<Preferences> {
    return firstValueFrom(
      this.http.put<Preferences>(`${this.baseUrl}/preferences`, request),
    );
  }
}
