import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AUTH_SERVICE } from 'api';

/**
 * Protects every non-public route. Implements L2-003:
 *   1. If an unexpired token is present, allow.
 *   2. If a token is missing or expired, attempt a silent refresh once.
 *   3. On failure, redirect to `/login?returnUrl=<requested>` (AC1).
 */
export const authGuard: CanActivateFn = async (_route, state) => {
  const auth = inject(AUTH_SERVICE);
  const router = inject(Router);

  if (auth.isAuthenticated()) return true;

  try {
    await auth.refresh();
    if (auth.isAuthenticated()) return true;
  } catch {
    /* fall through to redirect */
  }

  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url },
  });
};
