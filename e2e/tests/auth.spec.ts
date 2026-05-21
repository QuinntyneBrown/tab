// Acceptance Test
// Traces to: L2-001, L2-003, L2-004
// Description: Sign-in screen behaviour, route-guard redirects, sign-out from settings.

import { test, expect } from '../fixtures/app-fixtures';
import { viewports } from '../fixtures/viewports';
import { primaryUser } from '../fixtures/test-users';

test.describe('L2-001 — Sign-in screen', () => {
  test('AC1: unauthenticated user is redirected to /login with returnUrl preserved', async ({
    page,
  }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login\?returnUrl=%2Fdashboard/);
  });

  test('AC2: at XS the form fills the viewport with ≥16px gutter and no horizontal scroll', async ({
    page,
    loginPage,
  }) => {
    await page.setViewportSize(viewports.XS);
    await loginPage.goto();

    await expect(loginPage.signInButton).toBeVisible();

    const hasHorizontalScroll = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(hasHorizontalScroll).toBe(false);

    const card = loginPage.formCard;
    const box = await card.boundingBox();
    expect(box, 'login card should be measurable').not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(16);
    expect(box!.x + box!.width).toBeLessThanOrEqual(viewports.XS.width - 16);
  });

  test('AC3: at XL the form is a centered card ≤480px wide', async ({ page, loginPage }) => {
    await page.setViewportSize(viewports.XL);
    await loginPage.goto();

    const box = await loginPage.formCard.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeLessThanOrEqual(480);

    const centerOffset = Math.abs(box!.x + box!.width / 2 - viewports.XL.width / 2);
    expect(centerOffset).toBeLessThan(8);
  });

  test('AC4: valid credentials navigate to /dashboard (or returnUrl)', async ({
    page,
    loginPage,
  }) => {
    await page.goto('/loans');
    await expect(page).toHaveURL(/\/login\?returnUrl=%2Floans/);
    await loginPage.signIn(primaryUser.email, primaryUser.passcode);
    await expect(page).toHaveURL(/\/loans$/);
  });

  test('AC5: invalid credentials show a non-revealing error', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.signIn(primaryUser.email, 'wrong-passcode');
    await expect(loginPage.formError).toContainText(/email or passcode is incorrect/i);
    // Non-revealing: must not name which specific field was wrong.
    await expect(loginPage.formError).not.toContainText(/passcode (was|is) (wrong|invalid)/i);
    await expect(loginPage.formError).not.toContainText(/no such email/i);
  });
});

test.describe('L2-003 — Route guards', () => {
  const protectedRoutes = ['/dashboard', '/loans', '/bills', '/statement', '/settings', '/add'];

  for (const route of protectedRoutes) {
    test(`AC1: ${route} redirects to /login when unauthenticated`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL(new RegExp(`/login\\?returnUrl=${encodeURIComponent(route)}`));
    });
  }

  test('AC3: after sign-out, protected routes redirect to /login', async ({
    signedInPage,
    settingsPage,
  }) => {
    await settingsPage.goto();
    await settingsPage.signOutButton.click();
    await expect(signedInPage).toHaveURL(/\/login$/);

    await signedInPage.goto('/dashboard');
    await expect(signedInPage).toHaveURL(/\/login/);
  });
});

test.describe('L2-004 — Sign-out', () => {
  test('AC1: signs out, clears tokens, returns to /login', async ({
    signedInPage,
    settingsPage,
  }) => {
    await settingsPage.goto();
    await settingsPage.signOutButton.click();
    await expect(signedInPage).toHaveURL(/\/login$/);

    const storedToken = await signedInPage.evaluate(() =>
      window.sessionStorage.getItem('access_token'),
    );
    expect(storedToken).toBeNull();
  });

  test('AC2: browser back after sign-out does not reveal cached protected content', async ({
    signedInPage,
    settingsPage,
  }) => {
    await settingsPage.goto();
    await settingsPage.signOutButton.click();
    await signedInPage.goBack();
    await expect(signedInPage).toHaveURL(/\/login/);
  });
});
