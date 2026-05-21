import { InjectionToken } from '@angular/core';
import { IDashboardService } from './dashboard-service.interface';

export const DASHBOARD_SERVICE = new InjectionToken<IDashboardService>('DASHBOARD_SERVICE');
