import { Provider } from '@angular/core';
import { EXPORT_SERVICE } from './export-service.token';
import { ExportServiceHttp } from './export-service.http';

export function provideExportService(): Provider[] {
  return [ExportServiceHttp, { provide: EXPORT_SERVICE, useExisting: ExportServiceHttp }];
}
