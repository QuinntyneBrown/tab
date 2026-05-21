import { Provider } from '@angular/core';
import { BILLS_SERVICE } from './bills-service.token';
import { BillsServiceHttp } from './bills-service.http';

export function provideBillsService(): Provider[] {
  return [BillsServiceHttp, { provide: BILLS_SERVICE, useExisting: BillsServiceHttp }];
}
