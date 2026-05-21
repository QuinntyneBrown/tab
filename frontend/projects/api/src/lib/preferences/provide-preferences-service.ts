import { Provider } from '@angular/core';
import { PREFERENCES_SERVICE } from './preferences-service.token';
import { PreferencesServiceHttp } from './preferences-service.http';

export function providePreferencesService(): Provider[] {
  return [
    PreferencesServiceHttp,
    { provide: PREFERENCES_SERVICE, useExisting: PreferencesServiceHttp },
  ];
}
