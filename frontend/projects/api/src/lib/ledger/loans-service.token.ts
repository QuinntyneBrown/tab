import { InjectionToken } from '@angular/core';
import { ILoansService } from './loans-service.interface';

export const LOANS_SERVICE = new InjectionToken<ILoansService>('LOANS_SERVICE');
