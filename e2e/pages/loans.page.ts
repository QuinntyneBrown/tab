import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export type LedgerFilter = 'All' | 'Loans' | 'Bills' | 'Payments';

export class LoansPage extends BasePage {
  readonly path = '/loans';

  readonly summaryStrip: Locator;
  readonly monthGroups: Locator;
  readonly filterTabs: Locator;
  readonly emptyState: Locator;
  readonly addLoanCta: Locator;

  constructor(page: Page) {
    super(page);
    this.summaryStrip = page.getByTestId('ledger-summary');
    this.monthGroups = page.getByTestId('month-group');
    this.filterTabs = page.getByRole('tablist', { name: /filter/i });
    this.emptyState = page.getByTestId('ledger-empty');
    this.addLoanCta = page.getByTestId('ledger-add-loan');
  }

  filter(label: LedgerFilter): Locator {
    return this.filterTabs.getByRole('tab', { name: new RegExp(`^${label}$`, 'i') });
  }

  monthHeader(name: string | RegExp): Locator {
    return this.page.getByTestId('month-header').filter({ hasText: name });
  }

  ledgerRow(description: string | RegExp): Locator {
    return this.page.getByTestId('ledger-row').filter({ hasText: description });
  }

  async selectFilter(label: LedgerFilter): Promise<void> {
    await this.filter(label).click();
  }
}
