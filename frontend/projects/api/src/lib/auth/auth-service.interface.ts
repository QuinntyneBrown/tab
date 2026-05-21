import { Signal } from '@angular/core';
import { SignInRequest } from './sign-in-request.interface';

/**
 * Authentication facade for the app. The access token lives in memory only
 * (L2-001 AC4); refresh artifacts live in an httpOnly secure cookie set by the
 * backend. The interceptor calls {@link refresh} on a 401 to attempt silent
 * recovery (L2-003 AC2).
 */
export interface IAuthService {
  /** Current in-memory access token, or `null` when signed out. */
  readonly accessToken: Signal<string | null>;
  /** `true` when an unexpired access token is present. */
  readonly isAuthenticated: Signal<boolean>;

  signIn(request: SignInRequest): Promise<void>;
  refresh(): Promise<void>;
  signOut(): Promise<void>;
}
