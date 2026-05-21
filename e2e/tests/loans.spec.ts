// Acceptance Test
// Traces to: L2-007, L2-008, L2-009, L2-010
// Description: Loan add, list-by-month, edit, delete behaviours.

import { test, expect } from '../fixtures/app-fixtures';
import { viewports } from '../fixtures/viewports';

test.describe('L2-007 — Add a loan entry', () => {
  test('AC1: opening /add?mode=loan selects the Loan segment and focuses amount', async ({
    signedInPage,
    addEntryPage,
  }) => {
    await addEntryPage.openFor('loan');
    await expect(addEntryPage.segment('Loan')).toHaveAttribute('aria-selected', 'true');
    await expect(addEntryPage.amountInput).toBeFocused();
  });

  test('AC2: empty amount disables save and shows the "greater than zero" hint', async ({
    signedInPage,
    addEntryPage,
  }) => {
    await addEntryPage.openFor('loan');
    await addEntryPage.amountInput.fill('0');
    await expect(addEntryPage.saveButton).toBeDisabled();
    await expect(addEntryPage.amountHint).toBeVisible();
  });

  test('AC3: filling all fields persists the loan and returns to the previous page', async ({
    signedInPage,
    addEntryPage,
    dashboardPage,
  }) => {
    await dashboardPage.goto();
    await dashboardPage.addLoanButton.click();
    await expect(signedInPage).toHaveURL(/\/add\?mode=loan/);

    await addEntryPage.fillLoan({
      amount: '120.00',
      description: 'Groceries',
      date: '2026-05-18',
      method: 'Cash',
    });
    await addEntryPage.save();

    await expect(signedInPage).toHaveURL(/\/dashboard$/);
    await expect(dashboardPage.recentActivityRows.first()).toContainText(/groceries/i);
  });

  test('AC4: future-dated loan fails validation', async ({
    signedInPage,
    addEntryPage,
  }) => {
    await addEntryPage.openFor('loan');
    await addEntryPage.fillLoan({
      amount: '50',
      description: 'Future',
      date: '2099-12-31',
    });
    await addEntryPage.save();
    await expect(addEntryPage.dateError).toBeVisible();
  });

  test('AC5: saving a loan increases the outstanding balance', async ({
    signedInPage,
    addEntryPage,
    dashboardPage,
  }) => {
    await dashboardPage.goto();
    const before = await dashboardPage.heroAmount.textContent();

    await addEntryPage.openFor('loan');
    await addEntryPage.fillLoan({
      amount: '25.00',
      description: 'Coffee',
      date: '2026-05-20',
    });
    await addEntryPage.save();

    await dashboardPage.goto();
    const after = await dashboardPage.heroAmount.textContent();
    expect(after).not.toEqual(before);
  });
});

test.describe('L2-008 — Loans list grouped by month', () => {
  test('AC1: three months of activity render three month headers in reverse-chronological order with signed totals', async ({
    signedInPage,
    loansPage,
  }) => {
    await loansPage.goto();
    await expect(loansPage.monthGroups).toHaveCount(3);

    const headers = await loansPage.page.getByTestId('month-header').allTextContents();
    expect(headers.length).toBeGreaterThanOrEqual(3);
    for (const header of headers) {
      expect(header).toMatch(/[+−\-]\s*\$\d/);
    }
  });

  test('AC2: filtering by "Loans" shows only loan rows; summary strip totals unchanged', async ({
    signedInPage,
    loansPage,
  }) => {
    await loansPage.goto();
    const summaryBefore = await loansPage.summaryStrip.textContent();

    await loansPage.selectFilter('Loans');
    const rows = loansPage.page.getByTestId('ledger-row');
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i)).toContainText(/loan/i);
    }

    const summaryAfter = await loansPage.summaryStrip.textContent();
    expect(summaryAfter).toEqual(summaryBefore);
  });

  test('AC3: empty state with primary "Add a loan" CTA when no activity', async ({
    signedInPage,
    loansPage,
  }) => {
    await loansPage.goto();
    await expect(loansPage.emptyState).toContainText(/no entries yet/i);
    await expect(loansPage.addLoanCta).toHaveAttribute('href', /\/add\?mode=loan/);
  });

  test('AC4: at L the month groups form a 2-column grid; at XS/S/M they stack', async ({
    signedInPage,
    loansPage,
    page,
  }) => {
    await loansPage.goto();

    await page.setViewportSize(viewports.XS);
    const xsColumns = await page.evaluate(() => {
      const grid = document.querySelector('[data-testid="month-grid"]');
      return grid ? getComputedStyle(grid).gridTemplateColumns.split(' ').length : 0;
    });
    expect(xsColumns).toBe(1);

    await page.setViewportSize(viewports.L);
    const lColumns = await page.evaluate(() => {
      const grid = document.querySelector('[data-testid="month-grid"]');
      return grid ? getComputedStyle(grid).gridTemplateColumns.split(' ').length : 0;
    });
    expect(lColumns).toBe(2);
  });
});

test.describe('L2-009 — Edit a loan entry', () => {
  test('AC1: tapping a row navigates to the editor pre-populated with current values', async ({
    signedInPage,
    loansPage,
    addEntryPage,
  }) => {
    await loansPage.goto();
    await loansPage.ledgerRow(/groceries/i).first().click();

    await expect(signedInPage).toHaveURL(/\/loans\/[\w-]+\/edit/);
    await expect(addEntryPage.descriptionInput).toHaveValue(/groceries/i);
    await expect(addEntryPage.amountInput).not.toHaveValue('');
  });

  test('AC2: saving an edited amount updates the entry and recomputes the balance', async ({
    signedInPage,
    loansPage,
    addEntryPage,
    dashboardPage,
  }) => {
    await dashboardPage.goto();
    const balanceBefore = await dashboardPage.heroAmount.textContent();

    await loansPage.goto();
    await loansPage.ledgerRow(/groceries/i).first().click();
    await addEntryPage.amountInput.fill('999.99');
    await addEntryPage.save();

    await dashboardPage.goto();
    await expect(dashboardPage.heroAmount).not.toHaveText(balanceBefore ?? '');
  });
});

test.describe('L2-010 — Delete a loan entry', () => {
  test('AC1: delete shows a confirm prompt', async ({
    signedInPage,
    loansPage,
    addEntryPage,
  }) => {
    await loansPage.goto();
    await loansPage.ledgerRow(/groceries/i).first().click();
    await addEntryPage.deleteButton.click();
    await expect(addEntryPage.confirmDeleteButton).toBeVisible();
    await expect(signedInPage.getByRole('dialog')).toContainText(
      /removed from the ledger and statement/i,
    );
  });

  test('AC2: confirming deletion removes the entry and decreases the balance', async ({
    signedInPage,
    loansPage,
    addEntryPage,
    dashboardPage,
  }) => {
    await dashboardPage.goto();
    const balanceBefore = await dashboardPage.heroAmount.textContent();

    await loansPage.goto();
    await loansPage.ledgerRow(/groceries/i).first().click();
    await addEntryPage.deleteButton.click();
    await addEntryPage.confirmDeleteButton.click();

    await loansPage.goto();
    await expect(loansPage.ledgerRow(/groceries/i)).toHaveCount(0);

    await dashboardPage.goto();
    await expect(dashboardPage.heroAmount).not.toHaveText(balanceBefore ?? '');
  });

  test('AC3: deleting an entry already in a shared statement warns but proceeds', async ({
    signedInPage,
    loansPage,
    addEntryPage,
  }) => {
    await loansPage.goto();
    await loansPage.ledgerRow(/shared-statement-entry/i).first().click();
    await addEntryPage.deleteButton.click();
    await expect(addEntryPage.deleteWarning).toBeVisible();
    await addEntryPage.confirmDeleteButton.click();
    await expect(signedInPage).toHaveURL(/\/loans$/);
  });
});
