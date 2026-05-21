import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class BillsPage extends BasePage {
  readonly path = '/bills';

  readonly newBillButton: Locator;
  readonly billCards: Locator;
  readonly grid: Locator;
  readonly emptyState: Locator;

  // Editor (modal/sheet) controls
  readonly editor: Locator;
  readonly nameInput: Locator;
  readonly vendorInput: Locator;
  readonly expectedAmountInput: Locator;
  readonly dueDayInput: Locator;
  readonly splitPercentInput: Locator;
  readonly saveButton: Locator;
  readonly archiveButton: Locator;
  readonly confirmArchiveButton: Locator;

  constructor(page: Page) {
    super(page);
    this.newBillButton = page.getByRole('button', { name: /\+\s*new/i });
    this.grid = page.getByTestId('bills-grid');
    this.billCards = this.grid.getByTestId('bill-card');
    this.emptyState = page.getByTestId('bills-empty');

    this.editor = page.getByRole('dialog', { name: /bill/i });
    this.nameInput = this.editor.getByLabel(/name/i);
    this.vendorInput = this.editor.getByLabel(/vendor/i);
    this.expectedAmountInput = this.editor.getByLabel(/expected amount/i);
    this.dueDayInput = this.editor.getByLabel(/due day/i);
    this.splitPercentInput = this.editor.getByLabel(/split/i);
    this.saveButton = this.editor.getByRole('button', { name: /^save$/i });
    this.archiveButton = this.editor.getByRole('button', { name: /^archive$/i });
    this.confirmArchiveButton = page.getByRole('button', { name: /confirm archive/i });
  }

  card(name: string | RegExp): Locator {
    return this.billCards.filter({ hasText: name });
  }

  badge(card: Locator): Locator {
    return card.getByTestId('bill-badge');
  }

  markPaidInFull(card: Locator): Locator {
    return card.getByRole('button', { name: /mark paid in full/i });
  }

  logThisMonth(card: Locator): Locator {
    return card.getByRole('button', { name: /log this month/i });
  }

  async openEditor(card: Locator): Promise<void> {
    await card.getByRole('button', { name: /edit/i }).click();
    await expect(this.editor).toBeVisible();
  }
}
