// Acceptance Test
// Traces to: L2-019, L2-020
// Description: Statement view, totals, print stylesheet, share-link flow.

import { test, expect } from '../fixtures/app-fixtures';
import { SharedStatementPage } from '../pages/shared-statement.page';

test.describe('L2-019 — Generate a statement', () => {
  test('AC1: default period starts at earliest entry month and entries are chronological', async ({
    signedInPage,
    statementPage,
  }) => {
    await statementPage.goto();
    await expect(statementPage.periodFrom).toHaveValue(/\d{4}-\d{2}-01/);
    await expect(statementPage.periodTo).toHaveValue(/\d{4}-\d{2}-\d{2}/);

    const dates = await statementPage.entries.locator('[data-testid="entry-date"]').allTextContents();
    const sorted = [...dates].sort();
    expect(dates).toEqual(sorted);
  });

  test('AC2: a payment-in row shows leading "−" with muted styling', async ({
    signedInPage,
    statementPage,
  }) => {
    await statementPage.goto();
    const row = statementPage.entry(/payment received/i).first();
    await expect(row).toContainText(/−/);
    await expect(row.getByTestId('amount')).toHaveAttribute('data-muted', 'true');
  });

  test('AC3: Loans + Bills − Payments = Balance owing, matching GET /api/v1/balance', async ({
    signedInPage,
    statementPage,
  }) => {
    await statementPage.goto();

    const parse = async (locator: { textContent: () => Promise<string | null> }) => {
      const text = (await locator.textContent()) ?? '0';
      return Number(text.replace(/[^0-9.-]/g, ''));
    };

    const loans = await parse(statementPage.loansTotal);
    const bills = await parse(statementPage.billsTotal);
    const payments = await parse(statementPage.paymentsTotal);
    const balance = await parse(statementPage.balanceOwing);

    expect(Math.abs(loans + bills - payments - balance)).toBeLessThan(0.01);

    const apiBalance = await signedInPage.evaluate(async () => {
      const res = await fetch('/api/v1/balance', {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('access_token') ?? ''}` },
      });
      return (await res.json()).balance as number;
    });
    expect(Math.abs(apiBalance - balance)).toBeLessThan(0.01);
  });

  test('AC4: print stylesheet hides header and action bar', async ({
    signedInPage,
    statementPage,
  }) => {
    await statementPage.goto();
    await signedInPage.emulateMedia({ media: 'print' });

    await expect(statementPage.headerBar).toBeHidden();
    await expect(statementPage.actionBar).toBeHidden();

    const hasHorizontalOverflow = await signedInPage.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(hasHorizontalOverflow).toBe(false);
  });
});

test.describe('L2-020 — Share statement as link', () => {
  test('AC1: share action mints a 14-day signed URL and copies it to the clipboard', async ({
    signedInPage,
    statementPage,
  }) => {
    await signedInPage.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    await statementPage.goto();
    await statementPage.shareButton.click();

    await expect(statementPage.shareLinkToast).toBeVisible();
    const clipboard = await signedInPage.evaluate(() => navigator.clipboard.readText());
    expect(clipboard).toMatch(/\/s\/[A-Za-z0-9._-]+/);
  });

  test('AC2: expired share link shows "no longer available" with no entries', async ({
    page,
  }) => {
    const shared = new SharedStatementPage(page);
    await shared.openLink('expired-share-token');
    await expect(shared.expiredMessage).toBeVisible();
    await expect(shared.statement.getByTestId('statement-row')).toHaveCount(0);
  });

  test('AC3: a valid share link renders read-only with no nav and no editing affordances', async ({
    page,
  }) => {
    const shared = new SharedStatementPage(page);
    await shared.openLink('valid-share-token');

    await expect(shared.statement).toBeVisible();
    await expect(shared.nav).toHaveCount(0);
    await expect(shared.editAffordances).toHaveCount(0);
  });
});
