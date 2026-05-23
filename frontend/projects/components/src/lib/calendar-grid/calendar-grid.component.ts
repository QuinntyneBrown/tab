import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { CalendarCell } from './calendar-cell.interface';
import { CalendarChip } from './calendar-chip.interface';
import { CalendarChipActivatedEvent } from './calendar-chip-activated.event';

/**
 * Month grid for the calendar screen. Presentation-only: the page composes a
 * `CalendarCell[]` of exactly 42 cells (6 weeks × 7 days) and binds it via
 * `cells`. Emits `chipActivated` when a chip is clicked or activated by
 * keyboard, and `moreActivated` when the "+N more" overflow link is clicked.
 *
 * Mirrors docs/mocks/calendar.html — the SCSS uses the same class shapes so
 * the snapshot diff in Slice 12 reduces to typography drift only.
 */
@Component({
  selector: 'tab-calendar-grid',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './calendar-grid.component.html',
  styleUrl: './calendar-grid.component.scss',
})
export class CalendarGridComponent {
  @Input() weekdays: readonly string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  @Input() cells: readonly CalendarCell[] = [];
  @Input() ariaLabel = '';
  @Input() maxVisibleChips = 3;

  @Output() chipActivated = new EventEmitter<CalendarChipActivatedEvent>();
  @Output() moreActivated = new EventEmitter<string>();

  /** ISO dates whose cells should show all chips (after "+N more" activation). */
  private readonly expandedDates = signal<ReadonlySet<string>>(new Set());

  visibleChips(cell: CalendarCell): readonly CalendarChip[] {
    if (this.expandedDates().has(cell.iso)) return cell.chips;
    if (cell.chips.length <= this.maxVisibleChips) return cell.chips;
    return cell.chips.slice(0, this.maxVisibleChips);
  }

  hiddenChipCount(cell: CalendarCell): number {
    if (this.expandedDates().has(cell.iso)) return 0;
    return Math.max(0, cell.chips.length - this.maxVisibleChips);
  }

  formatAmount(amount: number): string {
    const sign = amount < 0 ? '−' : '';
    const abs = Math.abs(amount);
    return sign + '$' + abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  onChipClick(cell: CalendarCell, chip: CalendarChip): void {
    this.chipActivated.emit({ iso: cell.iso, chip });
  }

  onMoreClick(cell: CalendarCell): void {
    const next = new Set(this.expandedDates());
    next.add(cell.iso);
    this.expandedDates.set(next);
    this.moreActivated.emit(cell.iso);
  }
}
