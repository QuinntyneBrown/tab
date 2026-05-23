import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import {
  BILLS_SERVICE,
  CALENDAR_SERVICE,
  COUNTERPARTY_SERVICE,
  CalendarEntry,
  CalendarPayload,
  CalendarProjection,
  QueryResult,
} from 'api';
import {
  AgendaDay,
  AgendaRow,
  AgendaRowActivatedEvent,
  AppShellComponent,
  ButtonComponent,
  CalendarAgendaComponent,
  CalendarCell,
  CalendarChip,
  CalendarChipActivatedEvent,
  CalendarGridComponent,
  HeaderComponent,
  NavComponent,
} from 'components';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const MONTH_PARAM_RE = /^(\d{4})-(\d{2})$/;
type CalendarViewMode = 'month' | 'agenda';

@Component({
  selector: 'app-calendar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AppShellComponent,
    ButtonComponent,
    CalendarAgendaComponent,
    CalendarGridComponent,
    HeaderComponent,
    NavComponent,
  ],
  templateUrl: './calendar.page.html',
  styleUrl: './calendar.page.scss',
})
export class CalendarPage {
  private readonly calendarService = inject(CALENDAR_SERVICE);
  private readonly billsService = inject(BILLS_SERVICE);
  private readonly counterpartyService = inject(COUNTERPARTY_SERVICE);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly counterparty = this.counterpartyService.get();
  readonly counterpartyFirstName = computed(() => {
    const cp = this.counterparty.value();
    if (!cp?.name) return 'they';
    const first = cp.name.split(/\s+/)[0];
    return first || 'they';
  });

  readonly weekdays = WEEKDAYS;

  private readonly queryParams = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });

  readonly viewMonth = computed(() => this.parseMonth(this.queryParams().get('month')));
  /** True when the viewport is XS (< 576px). Updates on resize. */
  private readonly viewportXs = signal<boolean>(this.detectXsViewport());

  readonly view = computed<CalendarViewMode>(() => {
    const v = this.queryParams().get('view');
    if (v === 'agenda') return 'agenda';
    if (v === 'month') return 'month';
    // No explicit choice — default to agenda at XS (L2-057 AC1), month otherwise.
    return this.viewportXs() ? 'agenda' : 'month';
  });

  readonly isAgendaView = computed(() => this.view() === 'agenda');
  readonly isMonthView = computed(() => this.view() === 'month');

  private detectXsViewport(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(max-width: 575px)').matches;
  }

  readonly monthLabel = computed(() => {
    const { year, month } = this.viewMonth();
    return `${MONTH_NAMES[month - 1]} ${year}`;
  });

  private readonly fromIso = computed(() => {
    const { year, month } = this.viewMonth();
    return `${pad4(year)}-${pad2(month)}-01`;
  });

  private readonly toIso = computed(() => {
    const { year, month } = this.viewMonth();
    const last = new Date(year, month, 0).getDate();
    return `${pad4(year)}-${pad2(month)}-${pad2(last)}`;
  });

  /**
   * Current QueryResult, swapped in by the effect below whenever the URL's
   * `month` param changes. We don't keep it inside `computed(...)` because
   * `service.get(...)` is impure (issues HTTP + creates new signals), and
   * computeds must be pure. Instead, an effect drives the swap and the rest
   * of the page reads `query()` as a signal-of-signals.
   */
  private readonly query = signal<QueryResult<CalendarPayload> | null>(null);

  private readonly payload = computed(() => this.query()?.value());

  readonly cells = computed<readonly CalendarCell[]>(() =>
    this.buildCells(this.viewMonth(), this.payload()),
  );

  readonly agendaDays = computed<readonly AgendaDay[]>(() =>
    this.buildAgendaDays(this.payload()),
  );

  readonly isEmpty = computed(() => {
    const q = this.query();
    if (!q || q.status() !== 'success') return false;
    const p = q.value();
    if (!p) return false;
    return p.entries.length === 0 && p.projections.length === 0;
  });

  /**
   * Month-roll-up shown above the agenda — Lent / Bills / Paid back / Net
   * change — to match docs/mocks/calendar-agenda.html. Computed from the same
   * payload the agenda renders so no extra HTTP call.
   */
  readonly summary = computed(() => {
    const p = this.payload();
    if (!p) return { lent: 0, bills: 0, paidBack: 0, netChange: 0 };
    let lent = 0;
    let bills = 0;
    let paidBack = 0;
    for (const e of p.entries) {
      if (e.type === 'loan') lent += e.amount;
      else if (e.type === 'bill') bills += e.amount;
      else if (e.type === 'payment') paidBack += e.amount;
    }
    return { lent, bills, paidBack, netChange: lent + bills - paidBack };
  });

  /**
   * Used by visual-parity tests via `[data-ready]` — only true once the
   * calendar payload has resolved, so the screenshot is taken on a stable
   * frame rather than mid-fetch. We also flag ready on `'error'` so a busted
   * environment doesn't hang the visual run.
   */
  readonly dataReady = computed(() => {
    const q = this.query();
    if (!q) return false;
    const status = q.status();
    return status === 'success' || status === 'error';
  });

  constructor() {
    effect(() => {
      const from = this.fromIso();
      const to = this.toIso();
      this.query.set(this.calendarService.get(from, to));
    }, { allowSignalWrites: true });

    if (typeof window !== 'undefined') {
      const mql = window.matchMedia('(max-width: 575px)');
      const onChange = (e: MediaQueryListEvent): void => this.viewportXs.set(e.matches);
      mql.addEventListener('change', onChange);
    }
  }

  private parseMonth(raw: string | null): { year: number; month: number } {
    if (raw) {
      const m = MONTH_PARAM_RE.exec(raw);
      if (m) {
        const year = parseInt(m[1], 10);
        const month = parseInt(m[2], 10);
        if (year >= 1900 && year <= 9999 && month >= 1 && month <= 12) {
          return { year, month };
        }
      }
    }
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  }

  private buildCells(
    view: { year: number; month: number },
    payload: CalendarPayload | undefined,
  ): readonly CalendarCell[] {
    const chipsByDate = this.chipsByDate(payload);
    const todayIso = this.todayIso();

    const firstOfMonth = new Date(view.year, view.month - 1, 1);
    const gridStart = new Date(firstOfMonth);
    gridStart.setDate(1 - firstOfMonth.getDay());

    const cells: CalendarCell[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(gridStart);
      d.setDate(gridStart.getDate() + i);
      const iso = this.toIsoDate(d);
      cells.push({
        iso,
        day: d.getDate(),
        inMonth: d.getMonth() === view.month - 1,
        isToday: iso === todayIso,
        chips: chipsByDate.get(iso) ?? [],
      });
    }
    return cells;
  }

  private chipsByDate(payload: CalendarPayload | undefined): Map<string, CalendarChip[]> {
    const map = new Map<string, CalendarChip[]>();
    if (!payload) return map;

    for (const e of payload.entries) {
      this.push(map, e.date, this.chipFromEntry(e));
    }
    for (const p of payload.projections) {
      this.push(map, p.date, this.chipFromProjection(p));
    }

    const order: Record<CalendarChip['kind'], number> = {
      loan: 0,
      bill: 1,
      payment: 2,
      projected: 3,
    };
    for (const chips of map.values()) {
      chips.sort((a, b) => order[a.kind] - order[b.kind]);
    }
    return map;
  }

  private push(map: Map<string, CalendarChip[]>, iso: string, chip: CalendarChip): void {
    const arr = map.get(iso);
    if (arr) arr.push(chip);
    else map.set(iso, [chip]);
  }

  private chipFromEntry(e: CalendarEntry): CalendarChip {
    const amountText = this.formatChipAmount(e.amount, e.type === 'payment');
    return {
      id: e.id,
      kind: e.type,
      amount: e.type === 'payment' ? -e.amount : e.amount,
      title: e.description,
      tooltip: `${e.description} — ${this.typeWord(e.type)} · ${amountText}`,
      ariaLabel: `${this.typeWord(e.type, true)}, ${e.description}, ${amountText}`,
    };
  }

  private chipFromProjection(p: CalendarProjection): CalendarChip {
    const amountText = this.formatChipAmount(p.counterpartyShare, false);
    return {
      id: `proj-${p.billId}-${p.date}`,
      kind: 'projected',
      amount: p.counterpartyShare,
      title: p.billName,
      tooltip: `${p.billName} — projected bill split · ${amountText} · not yet posted`,
      ariaLabel: `Projected bill, ${p.billName}, ${amountText}, not yet posted`,
    };
  }

  private formatChipAmount(amount: number, negative: boolean): string {
    const sign = negative ? '−' : '';
    return sign + '$' + amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  /** Public helper for the summary strip in the agenda view. */
  formatSummaryAmount(amount: number, options: { signed?: boolean; negative?: boolean } = {}): string {
    const sign = options.negative ? '−' : options.signed && amount > 0 ? '+' : '';
    return sign + '$' + Math.abs(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  private typeWord(type: CalendarEntry['type'], titleCase = false): string {
    if (type === 'loan') return titleCase ? 'Loan' : 'loan';
    if (type === 'payment') return titleCase ? 'Payment in' : 'payment';
    return titleCase ? 'Bill split' : 'bill split';
  }

  private buildAgendaDays(payload: CalendarPayload | undefined): readonly AgendaDay[] {
    if (!payload) return [];
    const todayIso = this.todayIso();
    const map = new Map<string, AgendaRow[]>();
    const projected = new Set<string>();

    for (const e of payload.entries) {
      this.pushRow(map, e.date, this.agendaRowFromEntry(e));
    }
    for (const p of payload.projections) {
      this.pushRow(map, p.date, this.agendaRowFromProjection(p));
      projected.add(p.date);
    }

    const isos = Array.from(map.keys()).sort();
    return isos.map((iso) => {
      const d = this.fromIsoDate(iso);
      const rows = (map.get(iso) ?? []).sort((a, b) => {
        const order: Record<AgendaRow['kind'], number> = { loan: 0, bill: 1, payment: 2, projected: 3 };
        return order[a.kind] - order[b.kind];
      });
      const allProjected = rows.every((r) => r.kind === 'projected');
      return {
        iso,
        weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
        day: d.getDate(),
        month: d.toLocaleDateString('en-US', { month: 'short' }),
        isToday: iso === todayIso,
        isProjected: allProjected && projected.has(iso),
        rows,
      };
    });
  }

  private pushRow(map: Map<string, AgendaRow[]>, iso: string, row: AgendaRow): void {
    const arr = map.get(iso);
    if (arr) arr.push(row);
    else map.set(iso, [row]);
  }

  private agendaRowFromEntry(e: CalendarEntry): AgendaRow {
    const amountText = this.formatChipAmount(e.amount, e.type === 'payment');
    const label = this.typeWord(e.type, true);
    const title = e.type === 'payment'
      ? `Payment from ${this.counterpartyFirstName()}`
      : e.description;
    // Mock meta is "{pill}{trailing}" — pill is the type label with a chip
    // background; trailing is vendor (+ split for bills) or method.
    let trailing = e.meta ?? '';
    if (e.type === 'bill' && e.splitPercent > 0) {
      trailing = trailing ? `${trailing} · ${e.splitPercent}%` : `${e.splitPercent}%`;
    }
    return {
      id: e.id,
      kind: e.type,
      title,
      amount: e.type === 'payment' ? -e.amount : e.amount,
      meta: trailing,
      pill: label,
      ariaLabel: `${label}, ${title}, ${amountText}`,
    };
  }

  private agendaRowFromProjection(p: CalendarProjection): AgendaRow {
    const amountText = this.formatChipAmount(p.counterpartyShare, false);
    return {
      id: `proj-${p.billId}-${p.date}`,
      kind: 'projected',
      title: p.billName,
      amount: p.counterpartyShare,
      meta: 'not yet posted',
      pill: 'Bill split',
      ariaLabel: `Projected bill, ${p.billName}, ${amountText}, not yet posted`,
    };
  }

  private fromIsoDate(iso: string): Date {
    const [y, m, d] = iso.split('-').map((s) => parseInt(s, 10));
    return new Date(y, m - 1, d);
  }

  private todayIso(): string {
    return this.toIsoDate(new Date());
  }

  private toIsoDate(d: Date): string {
    return `${pad4(d.getFullYear())}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  }

  async navigatePrevMonth(): Promise<void> {
    await this.navigateMonths(-1);
  }
  async navigateNextMonth(): Promise<void> {
    await this.navigateMonths(1);
  }
  async navigateToday(): Promise<void> {
    const now = new Date();
    const target = `${pad4(now.getFullYear())}-${pad2(now.getMonth() + 1)}`;
    await this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { month: target },
      queryParamsHandling: 'merge',
    });
  }

  private async navigateMonths(delta: number): Promise<void> {
    const { year, month } = this.viewMonth();
    const total = year * 12 + (month - 1) + delta;
    const newYear = Math.floor(total / 12);
    const newMonth = (total % 12) + 1;
    const target = `${pad4(newYear)}-${pad2(newMonth)}`;
    await this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { month: target },
      queryParamsHandling: 'merge',
    });
  }

  async setView(view: CalendarViewMode): Promise<void> {
    await this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { view: view === 'agenda' ? 'agenda' : null },
      queryParamsHandling: 'merge',
    });
  }

  async onChipActivated(event: CalendarChipActivatedEvent): Promise<void> {
    const chip = event.chip;
    if (chip.kind === 'loan') {
      await this.router.navigate(['/loans', chip.id, 'edit']);
      return;
    }
    if (chip.kind === 'projected') {
      // Chip id is `proj-{billId}-{date}`. Recover the bill id.
      const idMatch = /^proj-(.+)-(\d{4}-\d{2}-\d{2})$/.exec(chip.id);
      if (!idMatch) return;
      const billId = idMatch[1];
      const date = idMatch[2];
      const period = date.slice(0, 7);
      try {
        await this.billsService.markPaidInFull(billId, { period, date });
        this.query()?.reload();
      } catch (err) {
        console.error('Mark-paid failed', err);
      }
      return;
    }
    // Posted bill and payment activations are not yet routed; L2-054 AC2/AC3
    // call for a detail sheet which is tracked separately.
  }

  onMoreActivated(iso: string): void {
    void iso;
  }

  async onAgendaRowActivated(event: AgendaRowActivatedEvent): Promise<void> {
    const row = event.row;
    if (row.kind === 'loan') {
      await this.router.navigate(['/loans', row.id, 'edit']);
      return;
    }
    if (row.kind === 'projected') {
      const idMatch = /^proj-(.+)-(\d{4}-\d{2}-\d{2})$/.exec(row.id);
      if (!idMatch) return;
      const billId = idMatch[1];
      const date = idMatch[2];
      const period = date.slice(0, 7);
      try {
        await this.billsService.markPaidInFull(billId, { period, date });
        this.query()?.reload();
      } catch (err) {
        console.error('Mark-paid failed', err);
      }
    }
  }
}

function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}
function pad4(n: number): string {
  return n.toString().padStart(4, '0');
}
