import { InjectionToken } from '@angular/core';
import { IPaymentsService } from './payments-service.interface';

export const PAYMENTS_SERVICE = new InjectionToken<IPaymentsService>('PAYMENTS_SERVICE');
