import { AgendaRow } from './agenda-row.interface';

export interface AgendaDay {
  readonly iso: string;
  readonly weekday: string;
  readonly day: number;
  readonly month: string;
  readonly isToday: boolean;
  readonly isProjected: boolean;
  readonly rows: readonly AgendaRow[];
}
