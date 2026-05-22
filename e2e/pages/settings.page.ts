import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class SettingsPage extends BasePage {
  readonly path = '/settings';

  readonly counterpartyName: Locator;
  readonly counterpartySave: Locator;
  readonly counterpartyError: Locator;
  readonly currencySelect: Locator;
  readonly defaultSplitInput: Locator;
  readonly reminderLeadInput: Locator;
  readonly preferencesSave: Locator;
  readonly exportButton: Locator;
  readonly signOutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.counterpartyName = page.getByLabel(/counterparty name/i);
    this.counterpartySave = page
      .getByTestId('counterparty-section')
      .getByRole('button', { name: /^save$/i });
    this.counterpartyError = page
      .getByTestId('counterparty-section')
      .getByRole('alert');
    this.currencySelect = page.getByLabel(/currency/i);
    this.defaultSplitInput = page.getByLabel(/default split/i);
    this.reminderLeadInput = page.getByLabel(/reminder lead/i);
    this.preferencesSave = page
      .getByTestId('preferences-section')
      .getByRole('button', { name: /^save$/i });
    this.exportButton = page.getByRole('button', { name: /export all entries/i });
    this.signOutButton = page.getByRole('button', { name: /sign out/i });
  }
}
