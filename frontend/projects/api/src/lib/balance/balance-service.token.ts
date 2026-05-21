import { InjectionToken } from '@angular/core';
import { IBalanceService } from './balance-service.interface';

export const BALANCE_SERVICE = new InjectionToken<IBalanceService>('BALANCE_SERVICE');
