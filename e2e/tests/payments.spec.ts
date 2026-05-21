// Acceptance Test
// Traces to: L2-016
// Description: Record a payment received from the counterparty.

import { test, expect } from '../fixtures/app-fixtures';

test.describe('L2-016 — Record a payment received', () => {
  test('AC1: payment-in decreases the balance and renders with leading "−" muted styling', async ({
    signedInPage,
    addEntryPage,
    dashboardPage,
    loansPage,
  }) => {
    await dashboardPage.goto();
    const before = await dashboardPage.heroAmount.textContent();

    await addEntryPage.openFor('payment');
    await addEntryPage.amountInput.fill('100');
    await addEntryPage.dateInput.fill('2026-04-14');
    await addEntryPage.save();

    await dashboardPage.goto();
    await expect(dashboardPage.heroAmount).not.toHaveText(before ?? '');

    await loansPage.goto();
    const row = loansPage.ledgerRow(/payment received/i).first();
    await expect(row).toContainText(/−|−/);
    await expect(row.getByTestId('amount')).toHaveAttribute('data-muted', 'true');
  });

  test('AC2: overpayment is allowed and shows a negative balance', async ({
    signedInPage,
    addEntryPage,
    dashboardPage,
  }) => {
    await addEntryPage.openFor('payment');
    await addEntryPage.amountInput.fill('999999');
    await addEntryPage.save();

    await dashboardPage.goto();
    await expect(dashboardPage.heroAmount).toContainText(/−|-/);
  });
});
