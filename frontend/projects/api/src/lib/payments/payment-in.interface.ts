export interface PaymentIn {
  readonly id: string;
  readonly amount: number;
  readonly date: string;
  readonly method?: string;
  readonly createdAt: string;
}
