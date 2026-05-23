import { AgendaRow } from './agenda-row.interface';

export interface AgendaRowActivatedEvent {
  readonly iso: string;
  readonly row: AgendaRow;
}
