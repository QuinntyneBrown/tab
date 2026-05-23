import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_BASE_URL } from '../common/api-base-url.token';
import { createQuery } from '../common/create-query';
import { QueryResult } from '../common/query-result.interface';
import { CalendarPayload } from './calendar-payload.interface';
import { ICalendarService } from './calendar-service.interface';

@Injectable()
export class CalendarServiceHttp implements ICalendarService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  get(from: string, to: string): QueryResult<CalendarPayload> {
    return createQuery(() =>
      this.http.get<CalendarPayload>(`${this.baseUrl}/calendar`, {
        params: new HttpParams().set('from', from).set('to', to),
      }),
    );
  }
}
