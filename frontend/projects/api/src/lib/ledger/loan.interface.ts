/** Single loan entry returned by `GET /loans/{id}`. */
export interface Loan {
  readonly id: string;
  readonly amount: number;
  readonly description: string;
  readonly date: string;
  readonly method?: string;
  readonly note?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}
