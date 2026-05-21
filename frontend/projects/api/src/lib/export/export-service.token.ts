import { InjectionToken } from '@angular/core';
import { IExportService } from './export-service.interface';

export const EXPORT_SERVICE = new InjectionToken<IExportService>('EXPORT_SERVICE');
