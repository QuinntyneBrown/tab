export interface MonthlySummary {
  readonly month: string;
  readonly lent: number;
  readonly bills: number;
  readonly paidBack: number;
  readonly netChange: number;
}
