export interface CreatePaymentRequest {
  readonly amount: number;
  readonly date: string;
  readonly method?: string;
}
