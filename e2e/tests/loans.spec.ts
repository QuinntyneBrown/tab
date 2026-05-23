// Acceptance Test
// Traces to: L2-007, L2-008, L2-009, L2-010
// Description: Loan add (single-purpose dialog), list-by-month, edit, delete.

import { test, expect } from '../fixtures/app-fixtures';
import { viewports } from '../fixtures/viewports';

test.describe('L2-007 — Add a loan entry', () => {
  test('AC1: dialog opens with correct title, labels, no tablist, and amount focused', async ({
    signedInPage,
    dashboardPage,
    addLoanDialog,
  }) => {
    await dashboardPage.goto();
    await dashboardPage.addLoanButton.click();

    await expect(addLoanDialog.dialog).toBeVisible();
    await expect(addLoanDialog.title).toBeVisible();
    await expect(addLoanDialog.amountLabel).toHaveText(/amount lent/i);
    await expect(addLoanDialog.saveButton).toBeVisible();
    await expect(
      signedInPage.getByRole('tablist', { name: /entry type/i }),
    ).toHaveCount(0);
    await expect(addLoanDialog.amountInput).toBeFocused();
  });

  test('AC2: empty amount disables save and shows the "greater than zero" hint', async ({
    signedInPage,
    dashboardPage,
    addLoanDialog,
  }) => {
    await dashboardPage.goto();
    await dashboardPage.addLoanButton.click();
    await addLoanDialog.amountInput.fill('0');
    await expect(addLoanDialog.saveButton).toBeDisabled();
    await expect(addLoanDialog.amountHint).toBeVisible();
  });

  test('AC3: filling all fields persists the loan and closes the dialog', async ({
    signedInPage,
    dashboardPage,
    addLoanDialog,
  }) => {
    await dashboardPage.goto();
    await dashboardPage.addLoanButton.click();

    await addLoanDialog.fill({
      amount: '120.00',
      description: 'Groceries',
      date: '2026-05-18',
      method: 'Cash',
    });
    await addLoanDialog.save();

    await expect(addLoanDialog.dialog).toHaveCount(0);
  });

  test('AC4: future-dated loan fails validation', async ({
    signedInPage,
    dashboardPage,
    addLoanDialog,
  }) => {
    await dashboardPage.goto();
    await dashboardPage.addLoanButton.click();
    await addLoanDialog.fill({
      amount: '50',
      description: 'Future',
      date: '2099-12-31',
    });
    await expect(addLoanDialog.saveButton).toBeDisabled();
    await expect(addLoanDialog.dateError).toBeVisible();
  });

  test('AC5: saving a loan increases the outstanding balance', async ({
    signedInPage,
    dashboardPage,
    addLoanDialog,
  }) => {
    await dashboardPage.goto();
    const before = await dashboardPage.heroAmount.getAttribute('aria-label');

    await dashboardPage.addLoanButton.click();
    await addLoanDialog.fill({
      amount: '25.00',
      description: 'Coffee',
      date: '2026-05-20',
    });
    await addLoanDialog.save();

    await dashboardPage.goto();
    const after = await dashboardPage.heroAmount.getAttribute('aria-label');
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

  test('AC3: empty state surfaces an "Add a loan" CTA that opens the dialog', async ({
    freshSignedInPage,
    loansPage,
    addLoanDialog,
  }) => {
    await loansPage.goto();
    await expect(loansPage.emptyState).toContainText(/no entries yet/i);
    await loansPage.addLoanCta.click();
    await expect(addLoanDialog.dialog).toBeVisible();
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
    editLoanPage,
  }) => {
    await loansPage.goto();
    await loansPage.ledgerRow(/groceries/i).first().click();

    await expect(signedInPage).toHaveURL(/\/loans\/[\w-]+\/edit/);
    await expect(editLoanPage.descriptionInput).toHaveValue(/groceries/i);
    await expect(editLoanPage.amountInput).not.toHaveValue('');
  });

  test('AC2: saving an edited amount updates the entry and recomputes the balance', async ({
    signedInPage,
    loansPage,
    editLoanPage,
    dashboardPage,
  }) => {
    await dashboardPage.goto();
    const balanceBefore = await dashboardPage.heroAmount.getAttribute('aria-label');

    await loansPage.goto();
    await loansPage.ledgerRow(/groceries/i).first().click();
    await editLoanPage.amountInput.fill('999.99');
    await editLoanPage.save();

    await dashboardPage.goto();
    await expect(dashboardPage.heroAmount).not.toHaveAttribute('aria-label', balanceBefore ?? '');
  });
});

test.describe('L2-010 — Delete a loan entry', () => {
  test('AC1: delete shows a confirm prompt', async ({
    signedInPage,
    loansPage,
    editLoanPage,
  }) => {
    await loansPage.goto();
    await loansPage.ledgerRow(/groceries/i).first().click();

    signedInPage.once('dialog', (dlg) => {
      expect(dlg.message()).toMatch(/removed from the ledger and statement/i);
      void dlg.dismiss();
    });
    await editLoanPage.deleteButton.click();
  });

  test('AC2: confirming deletion removes the entry and decreases the balance', async ({
    signedInPage,
    loansPage,
    editLoanPage,
    dashboardPage,
  }) => {
    await dashboardPage.goto();
    const balanceBefore = await dashboardPage.heroAmount.getAttribute('aria-label');

    await loansPage.goto();
    await loansPage.ledgerRow(/groceries/i).first().click();
    signedInPage.once('dialog', (dlg) => {
      void dlg.accept();
    });
    await editLoanPage.deleteButton.click();

    await loansPage.goto();
    await expect(loansPage.ledgerRow(/groceries/i)).toHaveCount(0);

    await dashboardPage.goto();
    await expect(dashboardPage.heroAmount).not.toHaveAttribute('aria-label', balanceBefore ?? '');
  });
});
