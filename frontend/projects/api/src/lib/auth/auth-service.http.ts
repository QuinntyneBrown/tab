import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../common/api-base-url.token';
import { IAuthService } from './auth-service.interface';
import { SignInRequest } from './sign-in-request.interface';
import { TokenResponse } from './token-response.interface';

interface DecodedAccessToken {
  readonly exp: number;
}

const REFRESH_STORAGE_KEY = 'tab.refresh_token';

@Injectable()
export class AuthServiceHttp implements IAuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  private readonly token = signal<string | null>(null);
  private readonly refreshTokenSignal = signal<string | null>(this.readPersistedRefresh());
  private readonly expiresAtMs = signal<number>(0);

  private readPersistedRefresh(): string | null {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    try {
      return window.localStorage.getItem(REFRESH_STORAGE_KEY);
    } catch {
      return null;
    }
  }

  private writePersistedRefresh(value: string | null): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      if (value === null) window.localStorage.removeItem(REFRESH_STORAGE_KEY);
      else window.localStorage.setItem(REFRESH_STORAGE_KEY, value);
    } catch {
      /* ignore */
    }
  }

  readonly accessToken = this.token.asReadonly();
  readonly isAuthenticated = computed(
    () => this.token() !== null && Date.now() < this.expiresAtMs(),
  );

  async signIn(request: SignInRequest): Promise<void> {
    const response = await firstValueFrom(
      this.http.post<TokenResponse>(`${this.baseUrl}/oauth/token`, {
        grant_type: 'password',
        email: request.email,
        password: request.passcode,
      }),
    );
    this.applyToken(response);
  }

  async refresh(): Promise<void> {
    const refresh = this.refreshTokenSignal();
    if (!refresh) throw new Error('No refresh token available');
    const response = await firstValueFrom(
      this.http.post<TokenResponse>(`${this.baseUrl}/oauth/token`, {
        grant_type: 'refresh_token',
        refresh_token: refresh,
      }),
    );
    this.applyToken(response);
  }

  async signOut(): Promise<void> {
    const refresh = this.refreshTokenSignal();
    try {
      if (refresh) {
        await firstValueFrom(
          this.http.post(`${this.baseUrl}/oauth/revoke`, { refresh_token: refresh }),
        );
      }
    } finally {
      this.token.set(null);
      this.refreshTokenSignal.set(null);
      this.expiresAtMs.set(0);
      this.writePersistedRefresh(null);
    }
  }

  private applyToken(response: TokenResponse): void {
    this.token.set(response.access_token);
    if (response.refresh_token) {
      this.refreshTokenSignal.set(response.refresh_token);
      this.writePersistedRefresh(response.refresh_token);
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem('tab.access_token', response.access_token);
      } catch {
        /* ignore */
      }
    }
    const decoded = this.decode(response.access_token);
    const expiresAt = decoded ? decoded.exp * 1000 : Date.now() + response.expires_in * 1000;
    this.expiresAtMs.set(expiresAt);
  }

  private decode(token: string): DecodedAccessToken | null {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    try {
      const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const decoded = JSON.parse(atob(payload)) as Partial<DecodedAccessToken>;
      return typeof decoded.exp === 'number' ? { exp: decoded.exp } : null;
    } catch {
      return null;
    }
  }
}
