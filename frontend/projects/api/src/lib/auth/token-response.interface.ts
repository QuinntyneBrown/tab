/**
 * Response from `POST /api/v1/oauth/token` (L2-002 AC1).
 * The refresh token is only present when the client identifies as a first-party
 * non-browser caller; browser clients receive it via an httpOnly cookie instead.
 */
export interface TokenResponse {
  readonly access_token: string;
  readonly token_type: 'Bearer';
  readonly expires_in: number;
  readonly refresh_token?: string;
}
