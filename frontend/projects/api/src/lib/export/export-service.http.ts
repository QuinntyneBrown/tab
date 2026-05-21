import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../common/api-base-url.token';
import { CsvExport } from './csv-export.interface';
import { IExportService } from './export-service.interface';

const FILENAME_REGEX = /filename\*?=(?:UTF-8''|")?([^";]+)"?/i;

@Injectable()
export class ExportServiceHttp implements IExportService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  async exportCsv(): Promise<CsvExport> {
    const response = await firstValueFrom(
      this.http.get(`${this.baseUrl}/export.csv`, {
        observe: 'response',
        responseType: 'blob',
      }),
    );
    const blob = response.body ?? new Blob([], { type: 'text/csv' });
    const disposition = response.headers.get('Content-Disposition') ?? '';
    const match = FILENAME_REGEX.exec(disposition);
    const filename =
      (match && decodeURIComponent(match[1])) ||
      `tab-statement-${new Date().toISOString().slice(0, 10)}.csv`;
    return { blob, filename };
  }
}
