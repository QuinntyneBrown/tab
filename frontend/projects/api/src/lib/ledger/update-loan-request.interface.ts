export interface UpdateLoanRequest {
  readonly amount: number;
  readonly description: string;
  readonly date: string;
  readonly method?: string;
  readonly note?: string;
}
