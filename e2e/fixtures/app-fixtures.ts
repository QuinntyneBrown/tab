import { test as base, expect, Page } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';
import { LoansPage } from '../pages/loans.page';
import { BillsPage } from '../pages/bills.page';
import { AddEntryPage } from '../pages/add-entry.page';
import { StatementPage } from '../pages/statement.page';
import { SettingsPage } from '../pages/settings.page';
import { AppShell } from '../pages/app-shell';
import { primaryUser, TestUser } from './test-users';

type AppFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  loansPage: LoansPage;
  billsPage: BillsPage;
  addEntryPage: AddEntryPage;
  statementPage: StatementPage;
  settingsPage: SettingsPage;
  appShell: AppShell;
  /** Page that has already been signed in as the primary test user. */
  signedInPage: Page;
  /** Hook for tests to swap which user to sign in as. */
  testUser: TestUser;
};

export const test = base.extend<AppFixtures>({
  testUser: [primaryUser, { option: true }],

  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  dashboardPage: async ({ page }, use) => use(new DashboardPage(page)),
  loansPage: async ({ page }, use) => use(new LoansPage(page)),
  billsPage: async ({ page }, use) => use(new BillsPage(page)),
  addEntryPage: async ({ page }, use) => use(new AddEntryPage(page)),
  statementPage: async ({ page }, use) => use(new StatementPage(page)),
  settingsPage: async ({ page }, use) => use(new SettingsPage(page)),
  appShell: async ({ page }, use) => use(new AppShell(page)),

  signedInPage: async ({ page, testUser }, use) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.signIn(testUser.email, testUser.passcode);
    await expect(page).toHaveURL(/\/dashboard$/);
    await use(page);
  },
});

export { expect };
