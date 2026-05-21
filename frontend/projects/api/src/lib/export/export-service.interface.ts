import { CsvExport } from './csv-export.interface';

export interface IExportService {
  exportCsv(): Promise<CsvExport>;
}
