import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class SharedStatementPage extends BasePage {
  readonly path = '/s';

  readonly statement: Locator;
  readonly expiredMessage: Locator;
  readonly nav: Locator;
  readonly editAffordances: Locator;

  constructor(page: Page) {
    super(page);
    this.statement = page.getByTestId('shared-statement');
    this.expiredMessage = page.getByText(/no longer available/i);
    this.nav = page.getByRole('navigation');
    this.editAffordances = page.getByRole('button', { name: /edit|delete|add/i });
  }

  async openLink(token: string): Promise<void> {
    await this.page.goto(`/s/${token}`);
  }
}
