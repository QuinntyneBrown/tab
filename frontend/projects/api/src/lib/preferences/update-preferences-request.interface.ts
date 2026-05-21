import { StatementTone } from './statement-tone.type';

export interface UpdatePreferencesRequest {
  readonly currency: string;
  readonly defaultSplitPercent: number;
  readonly reminderLeadDays: number;
  readonly statementTone: StatementTone;
}
