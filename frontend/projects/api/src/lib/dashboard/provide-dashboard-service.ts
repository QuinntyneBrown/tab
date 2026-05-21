import { Provider } from '@angular/core';
import { DASHBOARD_SERVICE } from './dashboard-service.token';
import { DashboardServiceHttp } from './dashboard-service.http';

export function provideDashboardService(): Provider[] {
  return [DashboardServiceHttp, { provide: DASHBOARD_SERVICE, useExisting: DashboardServiceHttp }];
}
