/**
 * RFC 7807 Problem Details payload returned by the backend on every error.
 * Includes `traceId` (correlation id) per L2-034 / L2-046.
 */
export interface ProblemDetails {
  readonly type?: string;
  readonly title: string;
  readonly status: number;
  readonly detail?: string;
  readonly instance?: string;
  readonly traceId?: string;
  readonly errors?: Readonly<Record<string, readonly string[]>>;
}
