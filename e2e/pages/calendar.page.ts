import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export type CalendarView = 'month' | 'agenda';
export type ChipType = 'loan' | 'bill' | 'payment' | 'projected';

export class CalendarPage extends BasePage {
  readonly path = '/calendar';

  // ─── Toolbar
  readonly monthLabel: Locator;
  readonly prevMonthButton: Locator;
  readonly nextMonthButton: Locator;
  readonly todayButton: Locator;
  readonly viewToggle: Locator;
  readonly emptyBanner: Locator;

  // ─── Month grid
  readonly monthGrid: Locator;
  readonly weekdayHeader: Locator;

  // ─── Agenda view
  readonly agenda: Locator;
  readonly filterAll: Locator;
  readonly filterLoans: Locator;
  readonly filterBills: Locator;
  readonly filterPayments: Locator;

  // ─── Detail sheets
  readonly billDetailSheet: Locator;
  readonly markPaidSheet: Locator;

  constructor(page: Page) {
    super(page);
    this.monthLabel = page.getByTestId('calendar-month-label');
    this.prevMonthButton = page.getByRole('button', { name: 'Previous month' });
    this.nextMonthButton = page.getByRole('button', { name: 'Next month' });
    this.todayButton = page.getByRole('button', { name: /^Today$/ });
    this.viewToggle = page.getByRole('tablist', { name: 'View' });
    this.emptyBanner = page.getByTestId('calendar-empty');

    this.monthGrid = page.getByTestId('calendar-month-grid');
    this.weekdayHeader = page.getByTestId('calendar-weekdays');

    this.agenda = page.getByTestId('calendar-agenda');
    this.filterAll = this.agenda.getByRole('button', { name: /^All$/ });
    this.filterLoans = this.agenda.getByRole('button', { name: /^Loans$/ });
    this.filterBills = this.agenda.getByRole('button', { name: /^Bills$/ });
    this.filterPayments = this.agenda.getByRole('button', { name: /^Payments$/ });

    this.billDetailSheet = page.getByTestId('calendar-bill-detail');
    this.markPaidSheet = page.getByTestId('calendar-mark-paid');
  }

  // ─── View switching
  viewTab(view: CalendarView): Locator {
    const name = view === 'month' ? /^Month$/ : /^Agenda$/;
    return this.viewToggle.getByRole('tab', { name });
  }
  async switchTo(view: CalendarView): Promise<void> {
    await this.viewTab(view).click();
  }

  // ─── Month-grid cell access
  cell(isoDate: string): Locator {
    return this.monthGrid.locator(`[data-date="${isoDate}"]`);
  }
  todayCell(): Locator {
    return this.monthGrid.locator('[data-today="true"]');
  }
  cellChips(isoDate: string): Locator {
    return this.cell(isoDate).getByTestId('calendar-chip');
  }
  cellChipsOfType(isoDate: string, type: ChipType): Locator {
    return this.cell(isoDate).locator(`[data-chip-type="${type}"]`);
  }
  cellMoreLink(isoDate: string): Locator {
    return this.cell(isoDate).getByTestId('calendar-chip-more');
  }

  // ─── Agenda-view day access
  agendaDay(isoDate: string): Locator {
    return this.agenda.locator(`[data-date="${isoDate}"]`);
  }
  agendaRows(isoDate: string): Locator {
    return this.agendaDay(isoDate).getByTestId('agenda-row');
  }

  // ─── Navigation helpers
  async gotoMonth(yyyyMm: string): Promise<void> {
    await this.goto({ month: yyyyMm });
  }
  async clickPrevMonth(): Promise<void> {
    await this.prevMonthButton.click();
  }
  async clickNextMonth(): Promise<void> {
    await this.nextMonthButton.click();
  }
  async clickToday(): Promise<void> {
    await this.todayButton.click();
  }
}
