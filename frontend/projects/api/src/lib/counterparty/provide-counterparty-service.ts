import { Provider } from '@angular/core';
import { COUNTERPARTY_SERVICE } from './counterparty-service.token';
import { CounterpartyServiceHttp } from './counterparty-service.http';

export function provideCounterpartyService(): Provider[] {
  return [
    CounterpartyServiceHttp,
    { provide: COUNTERPARTY_SERVICE, useExisting: CounterpartyServiceHttp },
  ];
}
