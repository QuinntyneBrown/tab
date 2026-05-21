// Acceptance Test
// Traces to: L2-011, L2-012, L2-013, L2-014, L2-015
// Description: Recurring-bill definition, list display, mark-paid posting, edit, archive.

import { test, expect } from '../fixtures/app-fixtures';
import { viewports } from '../fixtures/viewports';

test.describe('L2-011 — Define a recurring bill', () => {
  test('AC1: editor captures name, vendor, expected amount, due day, split percentage', async ({
    signedInPage,
    billsPage,
  }) => {
    await billsPage.goto();
    await billsPage.newBillButton.click();

    await expect(billsPage.nameInput).toBeVisible();
    await expect(billsPage.vendorInput).toBeVisible();
    await expect(billsPage.expectedAmountInput).toBeVisible();
    await expect(billsPage.dueDayInput).toBeVisible();
    await expect(billsPage.splitPercentInput).toBeVisible();
  });

  test('AC2: saving a valid bill makes it appear in the list with a next-due date', async ({
    signedInPage,
    billsPage,
  }) => {
    await billsPage.goto();
    await billsPage.newBillButton.click();
    await billsPage.nameInput.fill('Hydro');
    await billsPage.vendorInput.fill('Hydro One');
    await billsPage.expectedAmountInput.fill('168');
    await billsPage.dueDayInput.fill('15');
    await billsPage.splitPercentInput.fill('50');
    await billsPage.saveButton.click();

    const card = billsPage.card(/hydro/i);
    await expect(card).toBeVisible();
    await expect(billsPage.badge(card)).toContainText(/due in|next:/i);
  });

  test('AC3: split percentage of 100 fails validation with the bounded message', async ({
    signedInPage,
    billsPage,
  }) => {
    await billsPage.goto();
    await billsPage.newBillButton.click();
    await billsPage.nameInput.fill('Phone');
    await billsPage.expectedAmountInput.fill('70');
    await billsPage.dueDayInput.fill('5');
    await billsPage.splitPercentInput.fill('100');
    await billsPage.saveButton.click();

    await expect(
      signedInPage.getByText(/split must be between 1 and 99 percent/i),
    ).toBeVisible();
  });
});

test.describe('L2-012 — Bill list and next-due display', () => {
  test('AC1: bills due in <7 days show "Due in Nd" with a status dot', async ({
    signedInPage,
    billsPage,
  }) => {
    await billsPage.goto();
    const card = billsPage.card(/hydro/i);
    const badge = billsPage.badge(card);
    await expect(badge).toContainText(/due in \d+d/i);
    await expect(card.getByTestId('status-dot')).toBeVisible();
  });

  test('AC2: bills due in >7 days show "Next: MMM DD" in a quiet style', async ({
    signedInPage,
    billsPage,
  }) => {
    await billsPage.goto();
    const card = billsPage.card(/internet/i);
    await expect(billsPage.badge(card)).toContainText(/next: [a-z]{3} \d{1,2}/i);
  });

  test('AC3–AC5: responsive grid is 1/2/3 columns at XS-S / M / XL', async ({
    signedInPage,
    billsPage,
    page,
  }) => {
    await billsPage.goto();

    const columnsAt = async () =>
      page.evaluate(() => {
        const grid = document.querySelector('[data-testid="bills-grid"]');
        return grid ? getComputedStyle(grid).gridTemplateColumns.split(' ').length : 0;
      });

    await page.setViewportSize(viewports.XS);
    expect(await columnsAt()).toBe(1);

    await page.setViewportSize(viewports.M);
    expect(await columnsAt()).toBe(2);

    await page.setViewportSize(viewports.XL);
    expect(await columnsAt()).toBe(3);
  });
});

test.describe('L2-013 — Mark bill paid in full → automatic counterparty posting', () => {
  test('AC1: marking the Hydro card paid posts an $84 bill-split entry and bumps the balance', async ({
    signedInPage,
    billsPage,
    dashboardPage,
    loansPage,
  }) => {
    await dashboardPage.goto();
    const before = await dashboardPage.heroAmount.textContent();

    await billsPage.goto();
    const card = billsPage.card(/hydro/i);
    await billsPage.markPaidInFull(card).click();
    await signedInPage.getByRole('button', { name: /confirm/i }).click();

    await loansPage.goto();
    const newEntry = loansPage.ledgerRow(/hydro/i).first();
    await expect(newEntry).toContainText(/bill[- ]split/i);
    await expect(newEntry).toContainText(/84\.00/);

    await dashboardPage.goto();
    await expect(dashboardPage.heroAmount).not.toHaveText(before ?? '');
  });

  test('AC2: marking the same bill paid twice in one period shows "Period already recorded"', async ({
    signedInPage,
    billsPage,
  }) => {
    await billsPage.goto();
    const card = billsPage.card(/hydro/i);
    await billsPage.markPaidInFull(card).click();
    await signedInPage.getByRole('button', { name: /confirm/i }).click();
    await billsPage.markPaidInFull(card).click();
    await expect(signedInPage.getByText(/period already recorded/i)).toBeVisible();
  });

  test('AC3: "Log this month" with custom amount posts the actual share without altering the definition', async ({
    signedInPage,
    billsPage,
    loansPage,
  }) => {
    await billsPage.goto();
    const card = billsPage.card(/hydro/i);
    await billsPage.logThisMonth(card).click();
    await signedInPage.getByLabel(/actual amount/i).fill('156.84');
    await signedInPage.getByRole('button', { name: /^save$/i }).click();

    await loansPage.goto();
    await expect(loansPage.ledgerRow(/hydro/i).first()).toContainText(/78\.42/);

    await billsPage.goto();
    await expect(billsPage.card(/hydro/i)).toContainText(/\$168/);
  });
});

test.describe('L2-014 — Edit a recurring bill definition', () => {
  test('AC1: changing split percentage does not retroactively alter past postings', async ({
    signedInPage,
    billsPage,
    loansPage,
  }) => {
    await loansPage.goto();
    const aprilEntry = loansPage.ledgerRow(/hydro.*apr/i).first();
    const aprilText = await aprilEntry.textContent();

    await billsPage.goto();
    const card = billsPage.card(/hydro/i);
    await billsPage.openEditor(card);
    await billsPage.splitPercentInput.fill('60');
    await billsPage.saveButton.click();

    await loansPage.goto();
    await expect(loansPage.ledgerRow(/hydro.*apr/i).first()).toHaveText(aprilText ?? '');
  });

  test('AC2: changing expected amount applies on the next "Mark paid in full"', async ({
    signedInPage,
    billsPage,
    loansPage,
  }) => {
    await billsPage.goto();
    const card = billsPage.card(/internet/i);
    await billsPage.openEditor(card);
    await billsPage.expectedAmountInput.fill('110');
    await billsPage.saveButton.click();

    await billsPage.markPaidInFull(billsPage.card(/internet/i)).click();
    await signedInPage.getByRole('button', { name: /confirm/i }).click();

    await loansPage.goto();
    await expect(loansPage.ledgerRow(/internet/i).first()).toContainText(/55\.00/);
  });
});

test.describe('L2-015 — Archive a recurring bill', () => {
  test('AC1: archiving keeps historical postings in the ledger', async ({
    signedInPage,
    billsPage,
    loansPage,
  }) => {
    await loansPage.goto();
    const before = await loansPage.ledgerRow(/hydro/i).count();

    await billsPage.goto();
    await billsPage.openEditor(billsPage.card(/hydro/i));
    await billsPage.archiveButton.click();
    await billsPage.confirmArchiveButton.click();

    await loansPage.goto();
    const after = await loansPage.ledgerRow(/hydro/i).count();
    expect(after).toEqual(before);
  });

  test('AC2: archived bills disappear from the active list with no mark-paid actions', async ({
    signedInPage,
    billsPage,
  }) => {
    await billsPage.goto();
    await billsPage.openEditor(billsPage.card(/hydro/i));
    await billsPage.archiveButton.click();
    await billsPage.confirmArchiveButton.click();

    await billsPage.goto();
    await expect(billsPage.card(/hydro/i)).toHaveCount(0);
  });
});
