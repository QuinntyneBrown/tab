import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CORRELATION_ID_HEADER } from '../common/correlation-id.constant';

/**
 * Adds an `X-Correlation-Id` UUIDv4 to every outbound request if one is not
 * already present (L2-034 AC1). The backend echoes the same id on its response
 * and uses it as a structured log field.
 */
export function correlationIdInterceptor(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  if (request.headers.has(CORRELATION_ID_HEADER)) return next(request);
  const cloned = request.clone({
    setHeaders: { [CORRELATION_ID_HEADER]: newCorrelationId() },
  });
  return next(cloned);
}

function newCorrelationId(): string {
  const crypto: Crypto | undefined =
    typeof globalThis !== 'undefined' ? globalThis.crypto : undefined;
  if (crypto?.randomUUID) return crypto.randomUUID();
  return fallbackUuid();
}

function fallbackUuid(): string {
  const bytes = new Uint8Array(16);
  (globalThis.crypto ?? { getRandomValues: pseudoRandom }).getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0'));
  return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex
    .slice(6, 8)
    .join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10, 16).join('')}`;
}

function pseudoRandom(buf: Uint8Array): Uint8Array {
  for (let i = 0; i < buf.length; i++) buf[i] = Math.floor(Math.random() * 256);
  return buf;
}
