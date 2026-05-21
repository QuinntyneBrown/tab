export interface CreateRecurringBillRequest {
  readonly name: string;
  readonly vendor?: string;
  readonly expectedAmount: number;
  readonly dueDay: number;
  readonly splitPercent: number;
}
