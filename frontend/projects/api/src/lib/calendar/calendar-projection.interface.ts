export interface CalendarProjection {
  readonly billId: string;
  readonly date: string;
  readonly billName: string;
  readonly expectedAmount: number;
  readonly counterpartyShare: number;
}
