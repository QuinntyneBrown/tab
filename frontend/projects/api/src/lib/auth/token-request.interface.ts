import { TokenGrantType } from './token-grant-type.type';

/**
 * OAuth 2.0 token request body. `password` grant carries `username` and
 * `passcode`; `refresh_token` grant carries `refresh_token`.
 */
export interface TokenRequest {
  readonly grant_type: TokenGrantType;
  readonly username?: string;
  readonly passcode?: string;
  readonly refresh_token?: string;
}
