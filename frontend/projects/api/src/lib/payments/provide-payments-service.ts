import { Provider } from '@angular/core';
import { PAYMENTS_SERVICE } from './payments-service.token';
import { PaymentsServiceHttp } from './payments-service.http';

export function providePaymentsService(): Provider[] {
  return [PaymentsServiceHttp, { provide: PAYMENTS_SERVICE, useExisting: PaymentsServiceHttp }];
}
