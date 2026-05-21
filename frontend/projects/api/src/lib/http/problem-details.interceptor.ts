import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpRequest,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiError } from '../common/api-error';
import { ProblemDetails } from '../common/problem-details.interface';

/**
 * Translates a raw `HttpErrorResponse` carrying an `application/problem+json`
 * body (L2-046) into a typed {@link ApiError} so consumers never reach for
 * `HttpErrorResponse` directly.
 */
export function problemDetailsInterceptor(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  return next(request).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse)) return throwError(() => error);
      const problem = normalize(error);
      return throwError(() => new ApiError(error.status, problem));
    }),
  );
}

function normalize(error: HttpErrorResponse): ProblemDetails {
  const body = error.error as Partial<ProblemDetails> | string | null;
  if (body && typeof body === 'object') {
    return {
      type: body.type,
      title: body.title ?? error.statusText ?? 'Request failed',
      status: body.status ?? error.status,
      detail: body.detail,
      instance: body.instance,
      traceId: body.traceId,
      errors: body.errors,
    };
  }
  return {
    title: error.statusText || 'Request failed',
    status: error.status,
    detail: typeof body === 'string' ? body : undefined,
  };
}
