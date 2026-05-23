// Acceptance Test
// Traces to: L2-016
// Description: Record a payment received (single-purpose dialog).

import { test, expect } from '../fixtures/app-fixtures';

test.describe('L2-016 — Record a payment received', () => {
  test('AC1: dialog has correct title, labels, and no description/note fields', async ({
    signedInPage,
    dashboardPage,
    recordPaymentDialog,
  }) => {
    await dashboardPage.goto();
    await dashboardPage.recordPaymentButton.click();

    await expect(recordPaymentDialog.dialog).toBeVisible();
    await expect(recordPaymentDialog.title).toBeVisible();
    await expect(recordPaymentDialog.amountLabel).toHaveText(/amount received/i);
    await expect(recordPaymentDialog.saveButton).toBeVisible();
    await expect(recordPaymentDialog.descriptionInput).toHaveCount(0);
    await expect(recordPaymentDialog.noteInput).toHaveCount(0);
    await expect(
      signedInPage.getByRole('tablist', { name: /entry type/i }),
    ).toHaveCount(0);
  });

  test('AC2: payment-in decreases the balance and renders with leading "−" muted styling', async ({
    signedInPage,
    dashboardPage,
    recordPaymentDialog,
    loansPage,
  }) => {
    await dashboardPage.goto();
    const before = await dashboardPage.heroAmount.getAttribute('aria-label');

    await dashboardPage.recordPaymentButton.click();
    await recordPaymentDialog.fill({ amount: '100', date: '2026-04-14' });
    await recordPaymentDialog.save();

    await dashboardPage.goto();
    await expect(dashboardPage.heroAmount).not.toHaveAttribute('aria-label', before ?? '');

    await loansPage.goto();
    const row = loansPage.ledgerRow(/payment received/i).first();
    await expect(row).toContainText(/−|−/);
    await expect(row.getByTestId('amount')).toHaveAttribute('muted', '');
  });

  test('AC3: overpayment is allowed and shows a negative balance', async ({
    signedInPage,
    dashboardPage,
    recordPaymentDialog,
  }) => {
    await dashboardPage.goto();
    await dashboardPage.recordPaymentButton.click();
    await recordPaymentDialog.fill({ amount: '999999' });
    await recordPaymentDialog.save();

    await dashboardPage.goto();
    await expect(dashboardPage.heroAmount).toHaveAttribute('aria-label', /-\d/);
  });
});
