import { Locator, Page } from '@playwright/test';

/**
 * Single-purpose "Log a bill payment" dialog. Bill-payment form: amount,
 * description, date, method. No note field per the mock.
 */
export class LogBillPaymentDialogPage {
  readonly dialog: Locator;
  readonly title: Locator;
  readonly amountLabel: Locator;
  readonly amountInput: Locator;
  readonly descriptionInput: Locator;
  readonly dateInput: Locator;
  readonly methodInput: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly noteInput: Locator;
  readonly amountHint: Locator;
  readonly dateError: Locator;

  constructor(public readonly page: Page) {
    this.dialog = page.getByTestId('log-bill-payment-dialog');
    this.title = this.dialog.getByRole('heading', { name: /^Log a bill payment$/i });
    this.amountLabel = this.dialog.getByTestId('amount-label');
    this.amountInput = this.dialog.getByLabel(/amount paid/i);
    this.descriptionInput = this.dialog.getByLabel(/what was it for|description/i);
    this.dateInput = this.dialog.getByLabel(/^when$|^date$/i);
    this.methodInput = this.dialog.getByLabel(/^method$/i);
    this.saveButton = this.dialog.getByRole('button', { name: /^Save bill payment$/i });
    this.cancelButton = this.dialog.getByRole('button', { name: /^Cancel$/i });
    this.noteInput = this.dialog.getByLabel(/^note/i);
    this.amountHint = this.dialog.getByText(/enter an amount greater than zero/i);
    this.dateError = this.dialog.getByText(/date cannot be in the future/i);
  }

  async fill(values: {
    amount: string;
    description?: string;
    date?: string;
    method?: string;
  }): Promise<void> {
    await this.amountInput.fill(values.amount);
    if (values.description !== undefined) await this.descriptionInput.fill(values.description);
    if (values.date !== undefined) await this.dateInput.fill(values.date);
    if (values.method !== undefined) await this.methodInput.fill(values.method);
  }

  async save(): Promise<void> {
    await this.saveButton.click();
  }
}
