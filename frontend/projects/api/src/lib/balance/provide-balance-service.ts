import { Provider } from '@angular/core';
import { BALANCE_SERVICE } from './balance-service.token';
import { BalanceServiceHttp } from './balance-service.http';

export function provideBalanceService(): Provider[] {
  return [BalanceServiceHttp, { provide: BALANCE_SERVICE, useExisting: BalanceServiceHttp }];
}
