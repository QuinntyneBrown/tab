import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class DashboardPage extends BasePage {
  readonly path = '/dashboard';

  readonly heroCard: Locator;
  readonly heroEyebrow: Locator;
  readonly heroAmount: Locator;
  readonly heroMeta: Locator;
  readonly addLoanButton: Locator;
  readonly logBillButton: Locator;
  readonly nudge: Locator;
  readonly recentActivity: Locator;
  readonly recentActivityRows: Locator;
  readonly monthlySummary: Locator;
  readonly lentRow: Locator;
  readonly billsRow: Locator;
  readonly paidBackRow: Locator;
  readonly netChangeRow: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    super(page);
    this.heroCard = page.getByTestId('hero-card');
    this.heroEyebrow = this.heroCard.getByTestId('hero-eyebrow');
    this.heroAmount = this.heroCard.getByTestId('hero-amount');
    this.heroMeta = this.heroCard.getByTestId('hero-meta');
    this.addLoanButton = page.getByRole('link', { name: /add a loan/i });
    this.logBillButton = page.getByRole('link', { name: /log a bill/i });
    this.nudge = page.getByTestId('dashboard-nudge');
    this.recentActivity = page.getByTestId('recent-activity');
    this.recentActivityRows = this.recentActivity.getByRole('listitem');
    this.monthlySummary = page.getByTestId('monthly-summary');
    this.lentRow = this.monthlySummary.getByTestId('summary-lent');
    this.billsRow = this.monthlySummary.getByTestId('summary-bills');
    this.paidBackRow = this.monthlySummary.getByTestId('summary-paid-back');
    this.netChangeRow = this.monthlySummary.getByTestId('summary-net');
    this.emptyState = page.getByTestId('activity-empty');
  }
}
