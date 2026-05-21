/** Result of `GET /export.csv`. Filename follows `tab-statement-{yyyy-mm-dd}.csv`. */
export interface CsvExport {
  readonly filename: string;
  readonly blob: Blob;
}
