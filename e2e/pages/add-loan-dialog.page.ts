import { Locator, Page } from '@playwright/test';

/**
 * Single-purpose "Add a loan" dialog. Replaces the old combined add-entry
 * dialog. Locates by data-testid on the dialog root and exposes the fields
 * the loan form actually has — no segmented control.
 */
export class AddLoanDialogPage {
  readonly dialog: Locator;
  readonly title: Locator;
  readonly amountLabel: Locator;
  readonly amountInput: Locator;
  readonly descriptionInput: Locator;
  readonly dateInput: Locator;
  readonly methodInput: Locator;
  readonly noteInput: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly amountHint: Locator;
  readonly dateError: Locator;

  constructor(public readonly page: Page) {
    this.dialog = page.getByTestId('add-loan-dialog');
    this.title = this.dialog.getByRole('heading', { name: /^Add a loan$/i });
    this.amountLabel = this.dialog.getByTestId('amount-label');
    this.amountInput = this.dialog.getByLabel(/amount lent/i);
    this.descriptionInput = this.dialog.getByLabel(/what was it for|description/i);
    this.dateInput = this.dialog.getByLabel(/^when$|^date$/i);
    this.methodInput = this.dialog.getByLabel(/^method$/i);
    this.noteInput = this.dialog.getByLabel(/^note/i);
    this.saveButton = this.dialog.getByRole('button', { name: /^Save loan$/i });
    this.cancelButton = this.dialog.getByRole('button', { name: /^Cancel$/i });
    this.amountHint = this.dialog.getByText(/enter an amount greater than zero/i);
    this.dateError = this.dialog.getByText(/date cannot be in the future/i);
  }

  async fill(values: {
    amount: string;
    description?: string;
    date?: string;
    method?: string;
    note?: string;
  }): Promise<void> {
    await this.amountInput.fill(values.amount);
    if (values.description !== undefined) await this.descriptionInput.fill(values.description);
    if (values.date !== undefined) await this.dateInput.fill(values.date);
    if (values.method !== undefined) await this.methodInput.fill(values.method);
    if (values.note !== undefined) await this.noteInput.fill(values.note);
  }

  async save(): Promise<void> {
    await this.saveButton.click();
  }
}
