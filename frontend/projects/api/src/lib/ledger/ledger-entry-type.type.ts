/** Discriminator for a ledger row. Matches the `?type=` query parameter on `/loans`. */
export type LedgerEntryType = 'loan' | 'bill' | 'payment';
