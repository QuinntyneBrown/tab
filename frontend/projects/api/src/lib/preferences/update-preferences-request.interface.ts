export interface UpdatePreferencesRequest {
  readonly currency: string;
  readonly defaultSplitPercent: number;
  readonly reminderLeadDays: number;
}
