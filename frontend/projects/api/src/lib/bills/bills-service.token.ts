import { InjectionToken } from '@angular/core';
import { IBillsService } from './bills-service.interface';

export const BILLS_SERVICE = new InjectionToken<IBillsService>('BILLS_SERVICE');
