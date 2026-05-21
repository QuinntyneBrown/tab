import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../common/api-base-url.token';
import { createQuery } from '../common/create-query';
import { QueryResult } from '../common/query-result.interface';
import { ShareLink } from './share-link.interface';
import { ShareLinkRequest } from './share-link-request.interface';
import { IStatementService } from './statement-service.interface';
import { Statement } from './statement.interface';
import { StatementQuery } from './statement-query.interface';

@Injectable()
export class StatementServiceHttp implements IStatementService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  get(query: StatementQuery = {}): QueryResult<Statement> {
    let params = new HttpParams();
    if (query.from) params = params.set('from', query.from);
    if (query.to) params = params.set('to', query.to);
    return createQuery(() =>
      this.http.get<Statement>(`${this.baseUrl}/statement`, { params }),
    );
  }

  share(request: ShareLinkRequest): Promise<ShareLink> {
    return firstValueFrom(
      this.http.post<ShareLink>(`${this.baseUrl}/statement/share`, request),
    );
  }

  getShared(token: string): QueryResult<Statement> {
    return createQuery(() =>
      this.http.get<Statement>(`${this.baseUrl}/statement/shared/${token}`),
    );
  }
}
