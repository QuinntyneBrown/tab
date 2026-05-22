// Acceptance Test
// Traces to: L2-021
// Description: Currency, default split, and reminder lead-time preferences.

import { test, expect } from '../fixtures/app-fixtures';

test.describe('L2-021 — Edit preferences', () => {
  test('AC1: switching currency to USD renders the "$" symbol everywhere with "USD" exposed for export', async ({
    signedInPage,
    settingsPage,
    dashboardPage,
  }) => {
    await settingsPage.goto();
    await settingsPage.currencySelect.selectOption('USD');
    await settingsPage.preferencesSave.click();

    await dashboardPage.goto();
    await expect(dashboardPage.heroAmount).toContainText('$');

    const currencyAttr = await dashboardPage.heroAmount.getAttribute('data-currency');
    expect(currencyAttr).toBe('USD');
  });

  test('AC2: changing default split to 60 makes new-bill split default to 60', async ({
    signedInPage,
    settingsPage,
    billsPage,
  }) => {
    await settingsPage.goto();
    await settingsPage.defaultSplitInput.fill('60');
    await settingsPage.preferencesSave.click();

    await billsPage.goto();
    await billsPage.newBillButton.click();
    await expect(billsPage.splitPercentInput).toHaveValue('60');
  });

  test('AC3: reminder lead 7 surfaces any bill due within 7 days in the dashboard nudge', async ({
    signedInPage,
    settingsPage,
    dashboardPage,
  }) => {
    await settingsPage.goto();
    await settingsPage.reminderLeadInput.fill('7');
    await settingsPage.preferencesSave.click();

    await dashboardPage.goto();
    await expect(dashboardPage.nudge).toBeVisible();
    await expect(dashboardPage.nudge).toContainText(/due in \d+ day/i);
  });
});
