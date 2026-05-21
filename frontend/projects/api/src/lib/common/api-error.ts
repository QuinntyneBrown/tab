import { ProblemDetails } from './problem-details.interface';

/**
 * Thrown by every concrete api-library service when the backend responds with
 * an error. Wraps the parsed Problem Details body so consumers can render the
 * `title`, look up field-specific `errors`, or report the `traceId`.
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly problem: ProblemDetails,
  ) {
    super(problem.title || `Request failed with status ${status}`);
    this.name = 'ApiError';
  }
}
