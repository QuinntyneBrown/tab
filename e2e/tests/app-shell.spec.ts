// Acceptance Test
// Traces to: L2-028, L2-033
// Description: Cross-page app-shell behaviours (active-tab tracking, brand presence).

import { test, expect } from '../fixtures/app-fixtures';

test.describe('App shell — primary navigation', () => {
  test('active tab tracks the current route', async ({ signedInPage, appShell }) => {
    const cases: Array<{ path: string; tab: 'Home' | 'Loans' | 'Bills' | 'Settings' }> = [
      { path: '/dashboard', tab: 'Home' },
      { path: '/loans', tab: 'Loans' },
      { path: '/bills', tab: 'Bills' },
      { path: '/settings', tab: 'Settings' },
    ];

    for (const { path, tab } of cases) {
      await signedInPage.goto(path);
      await expect(appShell.activeTab()).toHaveAccessibleName(new RegExp(tab, 'i'));
    }
  });

  test('clicking a nav tab navigates to the corresponding route', async ({
    signedInPage,
    appShell,
  }) => {
    await signedInPage.goto('/dashboard');

    await appShell.navTab('Loans').click();
    await expect(signedInPage).toHaveURL(/\/loans$/);

    await appShell.navTab('Bills').click();
    await expect(signedInPage).toHaveURL(/\/bills$/);

    await appShell.navTab('Settings').click();
    await expect(signedInPage).toHaveURL(/\/settings$/);

    await appShell.navTab('Home').click();
    await expect(signedInPage).toHaveURL(/\/dashboard$/);
  });
});
