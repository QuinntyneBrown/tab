/** Optional period for `GET /statement`. Defaults are server-side (L2-019 AC1). */
export interface StatementQuery {
  readonly from?: string;
  readonly to?: string;
}
