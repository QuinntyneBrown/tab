import { signal } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { QueryResult } from './query-result.interface';
import { QueryStatus } from './query-status.type';

/**
 * Internal helper that converts an `Observable<T>` factory into a signal-only
 * {@link QueryResult}. Kept private to the library so consumers never see RxJS.
 */
export function createQuery<T>(factory: () => Observable<T>): QueryResult<T> {
  const value = signal<T | undefined>(undefined);
  const status = signal<QueryStatus>('idle');
  const error = signal<unknown | undefined>(undefined);
  let current: Subscription | undefined;

  const reload = (): void => {
    current?.unsubscribe();
    status.set('loading');
    error.set(undefined);
    current = factory().subscribe({
      next: (v) => {
        value.set(v);
        status.set('success');
      },
      error: (e) => {
        error.set(e);
        status.set('error');
      },
    });
  };

  reload();

  return {
    value: value.asReadonly(),
    status: status.asReadonly(),
    error: error.asReadonly(),
    reload,
  };
}
