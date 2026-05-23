// Acceptance Test
// Traces to: L2-006
// Description: Single counterparty per user — default placeholder and edit-from-settings flow.
//
// These tests use `freshSignedInPage` (a brand-new user registered per test)
// rather than the seeded `signedInPage` so the assertions about the default
// counterparty name and the rename flow run on a clean ledger uncontaminated
// by the visual-parity seed (which sets the primary user's counterparty to
// "Ray").

import { test, expect } from '../fixtures/app-fixtures';

test.describe('L2-006 — Single counterparty per user', () => {
  test('AC1: a freshly signed-in user already has a counterparty named "Counterparty"', async ({
    freshSignedInPage,
    dashboardPage,
  }) => {
    await dashboardPage.goto();
    await expect(dashboardPage.heroEyebrow).toContainText(/counterparty owes/i);
  });

  test('AC2: editing the counterparty name updates it everywhere', async ({
    freshSignedInPage,
    settingsPage,
    dashboardPage,
    loansPage,
    statementPage,
  }) => {
    await settingsPage.goto();
    await settingsPage.openCounterpartyEditor();
    await settingsPage.counterpartyName.fill('Raymond Brown');
    await settingsPage.counterpartySave.click();

    await dashboardPage.goto();
    await expect(dashboardPage.heroEyebrow).toContainText(/raymond brown owes/i);

    await loansPage.goto();
    await expect(loansPage.heading(1)).toContainText(/raymond brown/i);

    await statementPage.goto();
    await expect(statementPage.heading(1)).toContainText(/raymond brown/i);
  });

  test('AC3: empty counterparty name fails validation', async ({
    freshSignedInPage,
    settingsPage,
  }) => {
    await settingsPage.goto();
    await settingsPage.openCounterpartyEditor();
    await settingsPage.counterpartyName.fill('');
    await settingsPage.counterpartySave.click();
    await expect(settingsPage.counterpartyError).toContainText(/name is required/i);
  });
});
