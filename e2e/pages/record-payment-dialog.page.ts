import { Locator, Page } from '@playwright/test';

/**
 * Single-purpose "Record a payment" dialog. Payment-in form: amount, date,
 * method. Intentionally has no description or note fields per the mock.
 */
export class RecordPaymentDialogPage {
  readonly dialog: Locator;
  readonly title: Locator;
  readonly amountLabel: Locator;
  readonly amountInput: Locator;
  readonly dateInput: Locator;
  readonly methodInput: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly descriptionInput: Locator;
  readonly noteInput: Locator;
  readonly amountHint: Locator;
  readonly dateError: Locator;

  constructor(public readonly page: Page) {
    this.dialog = page.getByTestId('record-payment-dialog');
    this.title = this.dialog.getByRole('heading', { name: /^Record a payment$/i });
    this.amountLabel = this.dialog.getByTestId('amount-label');
    this.amountInput = this.dialog.getByLabel(/amount received/i);
    this.dateInput = this.dialog.getByLabel(/^when$|^date$/i);
    this.methodInput = this.dialog.getByLabel(/^method$/i);
    this.saveButton = this.dialog.getByRole('button', { name: /^Record payment$/i });
    this.cancelButton = this.dialog.getByRole('button', { name: /^Cancel$/i });
    // Tests assert these are absent.
    this.descriptionInput = this.dialog.getByLabel(/what was it for|description/i);
    this.noteInput = this.dialog.getByLabel(/^note/i);
    this.amountHint = this.dialog.getByText(/enter an amount greater than zero/i);
    this.dateError = this.dialog.getByText(/date cannot be in the future/i);
  }

  async fill(values: { amount: string; date?: string; method?: string }): Promise<void> {
    await this.amountInput.fill(values.amount);
    if (values.date !== undefined) await this.dateInput.fill(values.date);
    if (values.method !== undefined) await this.methodInput.fill(values.method);
  }

  async save(): Promise<void> {
    await this.saveButton.click();
  }
}
