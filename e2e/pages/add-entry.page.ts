import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export type EntryMode = 'loan' | 'bill' | 'payment';

export class AddEntryPage extends BasePage {
  readonly path = '/add';

  readonly segmentedControl: Locator;
  readonly amountLabel: Locator;
  readonly amountInput: Locator;
  readonly descriptionInput: Locator;
  readonly dateInput: Locator;
  readonly methodInput: Locator;
  readonly noteInput: Locator;
  readonly saveButton: Locator;
  readonly amountHint: Locator;
  readonly dateError: Locator;
  readonly deleteButton: Locator;
  readonly confirmDeleteButton: Locator;
  readonly deleteWarning: Locator;

  constructor(page: Page) {
    super(page);
    this.segmentedControl = page.getByRole('tablist', { name: /entry type/i });
    this.amountLabel = page.getByTestId('amount-label');
    this.amountInput = page.getByLabel(/amount/i);
    this.descriptionInput = page.getByLabel(/what was it for|description/i);
    this.dateInput = page.getByLabel(/^when$|^date$/i);
    this.methodInput = page.getByLabel(/^method$/i);
    this.noteInput = page.getByLabel(/^note/i);
    this.saveButton = page.getByRole('button', { name: /save entry/i });
    this.amountHint = page.getByText(/enter an amount greater than zero/i);
    this.dateError = page.getByText(/date cannot be in the future/i);
    this.deleteButton = page.getByRole('button', { name: /^delete$/i });
    this.confirmDeleteButton = page.getByRole('button', {
      name: /delete this entry/i,
    });
    this.deleteWarning = page.getByText(/already.*statement.*shared/i);
  }

  async openFor(mode: EntryMode): Promise<void> {
    await this.goto({ mode });
  }

  segment(label: 'Loan' | 'Bill payment' | 'Payment in'): Locator {
    return this.segmentedControl.getByRole('tab', { name: new RegExp(`^${label}$`, 'i') });
  }

  async selectSegment(label: 'Loan' | 'Bill payment' | 'Payment in'): Promise<void> {
    await this.segment(label).click();
  }

  async fillLoan(values: {
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
