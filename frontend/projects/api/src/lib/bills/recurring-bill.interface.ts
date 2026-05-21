import { BillCadence } from './bill-cadence.type';

export interface RecurringBill {
  readonly id: string;
  readonly name: string;
  readonly vendor?: string;
  readonly cadence: BillCadence;
  readonly expectedAmount: number;
  readonly dueDay: number;
  readonly splitPercent: number;
  readonly nextDueDate: string;
  readonly archived: boolean;
}
