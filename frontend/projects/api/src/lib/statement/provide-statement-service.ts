import { Provider } from '@angular/core';
import { STATEMENT_SERVICE } from './statement-service.token';
import { StatementServiceHttp } from './statement-service.http';

export function provideStatementService(): Provider[] {
  return [StatementServiceHttp, { provide: STATEMENT_SERVICE, useExisting: StatementServiceHttp }];
}
