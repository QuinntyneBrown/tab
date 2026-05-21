import { Provider } from '@angular/core';
import { AUTH_SERVICE } from './auth-service.token';
import { AuthServiceHttp } from './auth-service.http';

export function provideAuthService(): Provider[] {
  return [AuthServiceHttp, { provide: AUTH_SERVICE, useExisting: AuthServiceHttp }];
}
