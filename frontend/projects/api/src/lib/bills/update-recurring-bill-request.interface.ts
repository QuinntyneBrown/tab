export interface UpdateRecurringBillRequest {
  readonly name: string;
  readonly vendor?: string;
  readonly expectedAmount: number;
  readonly dueDay: number;
  readonly splitPercent: number;
}
