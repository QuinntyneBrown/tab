import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, from, switchMap, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AUTH_SERVICE } from '../auth/auth-service.token';

/**
 * Attaches `Authorization: Bearer <token>` to every API request and attempts a
 * single silent refresh on a 401 (L2-003 AC2). Requests against
 * `/oauth/token` and `/oauth/revoke` are passed through unmodified.
 */
export function authInterceptor(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  if (/\/oauth\/(token|revoke)$/.test(request.url)) return next(request);

  const auth = inject(AUTH_SERVICE);
  const token = auth.accessToken();
  const authed = token
    ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : request;

  return next(authed).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401) {
        return throwError(() => error);
      }
      return from(auth.refresh()).pipe(
        switchMap(() => {
          const refreshed = auth.accessToken();
          const retried = refreshed
            ? request.clone({ setHeaders: { Authorization: `Bearer ${refreshed}` } })
            : request;
          return next(retried);
        }),
        catchError((refreshError: unknown) => throwError(() => refreshError)),
      );
    }),
  );
}
