import { Locator, Page } from '@playwright/test';

/**
 * Routed editor page at `/loans/:id/edit` — distinct from the dialogs the
 * dashboard / loans page open for adding entries.
 */
export class EditLoanPage {
  readonly amountInput: Locator;
  readonly descriptionInput: Locator;
  readonly dateInput: Locator;
  readonly methodInput: Locator;
  readonly noteInput: Locator;
  readonly saveButton: Locator;
  readonly deleteButton: Locator;

  constructor(public readonly page: Page) {
    this.amountInput = page.getByLabel(/^Amount$/i);
    this.descriptionInput = page.getByLabel(/^Description$/i);
    this.dateInput = page.getByLabel(/^When$/i);
    this.methodInput = page.getByLabel(/^Method$/i);
    this.noteInput = page.getByLabel(/^Note$/i);
    this.saveButton = page.getByRole('button', { name: /save changes/i });
    this.deleteButton = page.getByRole('button', { name: /^Delete$/i });
  }

  async save(): Promise<void> {
    await this.saveButton.click();
  }
}
