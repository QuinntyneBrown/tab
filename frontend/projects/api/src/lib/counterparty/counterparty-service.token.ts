import { InjectionToken } from '@angular/core';
import { ICounterpartyService } from './counterparty-service.interface';

export const COUNTERPARTY_SERVICE = new InjectionToken<ICounterpartyService>(
  'COUNTERPARTY_SERVICE',
);
