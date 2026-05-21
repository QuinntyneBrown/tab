import { Signal } from '@angular/core';
import { QueryStatus } from './query-status.type';

/**
 * Resource-style wrapper around an HTTP GET. Components read signals only;
 * RxJS never crosses the api-library boundary (L2-039).
 */
export interface QueryResult<T> {
  readonly value: Signal<T | undefined>;
  readonly status: Signal<QueryStatus>;
  readonly error: Signal<unknown | undefined>;
  reload(): void;
}
