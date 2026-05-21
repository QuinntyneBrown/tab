import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class StatementPage extends BasePage {
  readonly path = '/statement';

  readonly periodFrom: Locator;
  readonly periodTo: Locator;
  readonly entries: Locator;
  readonly loansTotal: Locator;
  readonly billsTotal: Locator;
  readonly paymentsTotal: Locator;
  readonly balanceOwing: Locator;
  readonly shareButton: Locator;
  readonly shareLinkToast: Locator;
  readonly actionBar: Locator;
  readonly headerBar: Locator;

  constructor(page: Page) {
    super(page);
    this.periodFrom = page.getByLabel(/from/i);
    this.periodTo = page.getByLabel(/to/i);
    this.entries = page.getByTestId('statement-row');
    this.loansTotal = page.getByTestId('total-loans');
    this.billsTotal = page.getByTestId('total-bills');
    this.paymentsTotal = page.getByTestId('total-payments');
    this.balanceOwing = page.getByTestId('balance-owing');
    this.shareButton = page.getByRole('button', { name: /^send to|^share/i });
    this.shareLinkToast = page.getByRole('status').filter({ hasText: /link copied/i });
    this.actionBar = page.getByTestId('statement-actions');
    this.headerBar = page.getByTestId('app-header');
  }

  entry(description: string | RegExp): Locator {
    return this.entries.filter({ hasText: description });
  }
}
