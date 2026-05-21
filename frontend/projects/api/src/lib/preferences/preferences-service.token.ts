import { InjectionToken } from '@angular/core';
import { IPreferencesService } from './preferences-service.interface';

export const PREFERENCES_SERVICE = new InjectionToken<IPreferencesService>('PREFERENCES_SERVICE');
