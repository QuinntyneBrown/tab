/**
 * One-time signed share URL minted by `POST /statement/share`. Valid for 14
 * days per L2-020 AC1; the response carries the absolute URL ready for the
 * clipboard.
 */
export interface ShareLink {
  readonly url: string;
  readonly token: string;
  readonly expiresAt: string;
}
