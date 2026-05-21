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

@Injectable()
export class AuthServiceHttp implements IAuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  private readonly token = signal<string | null>(null);
  private readonly expiresAtMs = signal<number>(0);

  readonly accessToken = this.token.asReadonly();
  readonly isAuthenticated = computed(
    () => this.token() !== null && Date.now() < this.expiresAtMs(),
  );

  async signIn(request: SignInRequest): Promise<void> {
    const response = await firstValueFrom(
      this.http.post<TokenResponse>(
        `${this.baseUrl}/oauth/token`,
        {
          grant_type: 'password',
          username: request.email,
          passcode: request.passcode,
        },
        { withCredentials: true },
      ),
    );
    this.applyToken(response);
  }

  async refresh(): Promise<void> {
    const response = await firstValueFrom(
      this.http.post<TokenResponse>(
        `${this.baseUrl}/oauth/token`,
        { grant_type: 'refresh_token' },
        { withCredentials: true },
      ),
    );
    this.applyToken(response);
  }

  async signOut(): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post(`${this.baseUrl}/oauth/revoke`, {}, { withCredentials: true }),
      );
    } finally {
      this.token.set(null);
      this.expiresAtMs.set(0);
    }
  }

  private applyToken(response: TokenResponse): void {
    this.token.set(response.access_token);
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
