// Acceptance Test
// Traces to: L2-017, L2-018
// Description: Outstanding-balance computation and dashboard layout / content.

import { test, expect } from '../fixtures/app-fixtures';
import { viewports } from '../fixtures/viewports';

test.describe('L2-017 — Outstanding balance computation', () => {
  test('AC1: balance equals sum(loans) + sum(bill splits) − sum(payments-in)', async ({
    signedInPage,
    dashboardPage,
  }) => {
    await dashboardPage.goto();
    await expect(dashboardPage.heroAmount).toContainText(/1[, ]?284\.50/);
  });

  test('AC2: a new entry is reflected in the next dashboard load with no client recomputation', async ({
    signedInPage,
    addLoanDialog,
    dashboardPage,
  }) => {
    await dashboardPage.goto();
    const before = await dashboardPage.heroAmount.textContent();

    await dashboardPage.addLoanButton.click();
    await addLoanDialog.fill({
      amount: '10',
      description: 'Snack',
      date: '2026-05-20',
    });
    await addLoanDialog.save();

    await dashboardPage.goto();
    await expect(dashboardPage.heroAmount).not.toHaveText(before ?? '');
  });
});

test.describe('L2-018 — Dashboard layout and content', () => {
  test('AC1: hero balance scales from 48px at XS to 88px at XL', async ({
    signedInPage,
    dashboardPage,
    page,
  }) => {
    await dashboardPage.goto();

    await page.setViewportSize({ width: 320, height: 700 });
    const xsSize = parseFloat(
      await dashboardPage.heroAmount.evaluate((el) => getComputedStyle(el).fontSize),
    );
    expect(xsSize).toBeGreaterThanOrEqual(48);

    await page.setViewportSize(viewports.XL);
    const xlSize = parseFloat(
      await dashboardPage.heroAmount.evaluate((el) => getComputedStyle(el).fontSize),
    );
    expect(xlSize).toBeLessThanOrEqual(88);
    expect(xlSize).toBeGreaterThan(xsSize);
  });

  test('AC2: at least one bill within the reminder window surfaces a nudge', async ({
    signedInPage,
    dashboardPage,
  }) => {
    await dashboardPage.goto();
    await expect(dashboardPage.nudge).toBeVisible();
    await expect(dashboardPage.nudge).toContainText(/hydro/i);
    await expect(dashboardPage.nudge).toContainText(/due in \d+ day/i);
    await expect(dashboardPage.nudge).toContainText(/\$\d/);
  });

  test('AC3: with zero bills in the reminder window the nudge area is absent', async ({
    signedInPage,
    settingsPage,
    dashboardPage,
  }) => {
    await settingsPage.goto();
    await settingsPage.openReminderLeadEditor();
    await settingsPage.reminderLeadInput.fill('1');
    await settingsPage.preferencesSave.click();

    await dashboardPage.goto();
    await expect(dashboardPage.nudge).toHaveCount(0);
  });

  test('AC4: at M and above, recent-activity and monthly-summary sit side-by-side', async ({
    signedInPage,
    dashboardPage,
    page,
  }) => {
    await dashboardPage.goto();

    await page.setViewportSize(viewports.M);
    const recentBox = await dashboardPage.recentActivity.boundingBox();
    const summaryBox = await dashboardPage.monthlySummary.boundingBox();
    expect(recentBox && summaryBox).toBeTruthy();
    expect(Math.abs(recentBox!.y - summaryBox!.y)).toBeLessThan(10);

    await page.setViewportSize(viewports.XS);
    const recentXs = await dashboardPage.recentActivity.boundingBox();
    const summaryXs = await dashboardPage.monthlySummary.boundingBox();
    expect(summaryXs!.y).toBeGreaterThan(recentXs!.y);
  });

  test('AC5: with no activity, hero is $0.00 and summary shows all zeros', async ({
    signedInPage,
    dashboardPage,
  }) => {
    await dashboardPage.goto();
    await expect(dashboardPage.heroAmount).toContainText(/\$0\.00/);
    await expect(dashboardPage.emptyState).toBeVisible();
    await expect(dashboardPage.lentRow).toContainText(/\$0\.00/);
    await expect(dashboardPage.billsRow).toContainText(/\$0\.00/);
    await expect(dashboardPage.paidBackRow).toContainText(/\$0\.00/);
    await expect(dashboardPage.netChangeRow).toContainText(/\$0\.00/);
  });
});
