import { Provider } from '@angular/core';
import { ME_SERVICE } from './me-service.token';
import { MeServiceHttp } from './me-service.http';

export function provideMeService(): Provider[] {
  return [MeServiceHttp, { provide: ME_SERVICE, useExisting: MeServiceHttp }];
}
