import { Provider } from '@angular/core';
import { CALENDAR_SERVICE } from './calendar-service.token';
import { CalendarServiceHttp } from './calendar-service.http';

export function provideCalendarService(): Provider[] {
  return [CalendarServiceHttp, { provide: CALENDAR_SERVICE, useExisting: CalendarServiceHttp }];
}
