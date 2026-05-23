import {
  ChangeDetectionStrategy,
  Component,
  computed,
  EventEmitter,
  input,
  Output,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { AgendaDay } from './agenda-day.interface';
import { AgendaFilter } from './agenda-filter.type';
import { AgendaRow } from './agenda-row.interface';
import { AgendaRowActivatedEvent } from './agenda-row-activated.event';

/**
 * Chronological list view of the calendar. Renders one section per date that
 * has at least one entry, with filter pills for All/Loans/Bills/Payments.
 * Mirrors docs/mocks/calendar-agenda.html. Presentation-only — the page
 * supplies a `days: AgendaDay[]` derived from the same `/calendar` payload
 * the month grid consumes.
 *
 * `days` is a signal input so the `visibleDays` computed properly invalidates
 * when the page swaps in a new array; a classic `@Input` would make computeds
 * unreactive to input changes and the agenda would freeze at the initial
 * empty default.
 */
@Component({
  selector: 'tab-calendar-agenda',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './calendar-agenda.component.html',
  styleUrl: './calendar-agenda.component.scss',
})
export class CalendarAgendaComponent {
  readonly days = input<readonly AgendaDay[]>([]);

  @Output() rowActivated = new EventEmitter<AgendaRowActivatedEvent>();
  @Output() filterChanged = new EventEmitter<AgendaFilter>();

  readonly filter = signal<AgendaFilter>('all');

  readonly visibleDays = computed<readonly AgendaDay[]>(() => {
    const f = this.filter();
    const all = this.days();
    if (f === 'all') return all;
    return all
      .map<AgendaDay>((d) => ({
        ...d,
        rows: d.rows.filter((r) => r.kind === f || (f === 'bill' && r.kind === 'projected')),
      }))
      .filter((d) => d.rows.length > 0);
  });

  setFilter(filter: AgendaFilter): void {
    this.filter.set(filter);
    this.filterChanged.emit(filter);
  }

  isFilter(filter: AgendaFilter): boolean {
    return this.filter() === filter;
  }

  formatAmount(amount: number, kind: AgendaRow['kind']): string {
    const sign = kind === 'payment' ? '−' : '';
    return sign + '$' + Math.abs(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  onRowClick(day: AgendaDay, row: AgendaRow): void {
    this.rowActivated.emit({ iso: day.iso, row });
  }
}
