import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Settings page driver. The page now displays each preference and the
 * counterparty as read-only rows that open an inline editor on tap; the
 * `open…Editor()` helpers click the right row first so tests can use the
 * field locators below as if the editor were always present.
 */
export class SettingsPage extends BasePage {
  readonly path = '/settings';

  readonly counterpartyEditButton: Locator;
  readonly counterpartyName: Locator;
  readonly counterpartySave: Locator;
  readonly counterpartyError: Locator;

  readonly currencyRow: Locator;
  readonly currencySelect: Locator;
  readonly defaultSplitRow: Locator;
  readonly defaultSplitInput: Locator;
  readonly reminderLeadRow: Locator;
  readonly reminderLeadInput: Locator;
  readonly preferencesSave: Locator;

  readonly exportButton: Locator;
  readonly signOutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.counterpartyEditButton = page.getByTestId('counterparty-edit');
    this.counterpartyName = page.getByLabel(/counterparty name/i);
    this.counterpartySave = page
      .getByTestId('people-section')
      .getByRole('button', { name: /^save$/i });
    this.counterpartyError = page
      .getByTestId('people-section')
      .getByRole('alert');

    this.currencyRow = page.getByRole('button', { name: /^Currency/i });
    this.currencySelect = page.getByLabel(/^currency$/i);
    this.defaultSplitRow = page.getByRole('button', { name: /^Default bill split/i });
    this.defaultSplitInput = page.getByLabel(/default bill split/i);
    this.reminderLeadRow = page.getByRole('button', { name: /^Reminders/i });
    this.reminderLeadInput = page.getByLabel(/reminder lead time/i);
    this.preferencesSave = page
      .getByTestId('preferences-section')
      .getByRole('button', { name: /^save$/i });

    this.exportButton = page.getByRole('button', { name: /export all entries/i });
    this.signOutButton = page.getByRole('button', { name: /sign out/i });
  }

  async openCounterpartyEditor(): Promise<void> {
    await this.counterpartyEditButton.click();
  }

  async openCurrencyEditor(): Promise<void> {
    await this.currencyRow.click();
  }

  async openDefaultSplitEditor(): Promise<void> {
    await this.defaultSplitRow.click();
  }

  async openReminderLeadEditor(): Promise<void> {
    await this.reminderLeadRow.click();
  }
}
