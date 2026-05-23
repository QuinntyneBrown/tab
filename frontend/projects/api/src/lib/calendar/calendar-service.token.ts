import { InjectionToken } from '@angular/core';
import { ICalendarService } from './calendar-service.interface';

export const CALENDAR_SERVICE = new InjectionToken<ICalendarService>('CALENDAR_SERVICE');
