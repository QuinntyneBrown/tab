import { InjectionToken } from '@angular/core';
import { IMeService } from './me-service.interface';

export const ME_SERVICE = new InjectionToken<IMeService>('ME_SERVICE');
