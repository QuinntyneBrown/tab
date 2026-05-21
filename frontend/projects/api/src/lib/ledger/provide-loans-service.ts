import { Provider } from '@angular/core';
import { LOANS_SERVICE } from './loans-service.token';
import { LoansServiceHttp } from './loans-service.http';

export function provideLoansService(): Provider[] {
  return [LoansServiceHttp, { provide: LOANS_SERVICE, useExisting: LoansServiceHttp }];
}
