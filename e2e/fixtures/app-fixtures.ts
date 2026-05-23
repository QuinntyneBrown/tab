import { APIRequestContext, request as playwrightRequest, test as base, expect, Page } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';
import { LoansPage } from '../pages/loans.page';
import { BillsPage } from '../pages/bills.page';
import { AddLoanDialogPage } from '../pages/add-loan-dialog.page';
import { RecordPaymentDialogPage } from '../pages/record-payment-dialog.page';
import { LogBillPaymentDialogPage } from '../pages/log-bill-payment-dialog.page';
import { EditLoanPage } from '../pages/edit-loan.page';
import { CalendarPage } from '../pages/calendar.page';
import { StatementPage } from '../pages/statement.page';
import { SettingsPage } from '../pages/settings.page';
import { AppShell } from '../pages/app-shell';
import { primaryUser, TestUser } from './test-users';

type AppFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  loansPage: LoansPage;
  billsPage: BillsPage;
  addLoanDialog: AddLoanDialogPage;
  recordPaymentDialog: RecordPaymentDialogPage;
  logBillPaymentDialog: LogBillPaymentDialogPage;
  editLoanPage: EditLoanPage;
  calendarPage: CalendarPage;
  statementPage: StatementPage;
  settingsPage: SettingsPage;
  appShell: AppShell;
  /** Page that has already been signed in as the primary test user. */
  signedInPage: Page;
  /**
   * An APIRequestContext signed in as `testUser` via the OAuth password grant.
   * The Authorization: Bearer header is attached for every call. Use this in
   * preference to `signedInPage.request` for backend-only assertions or for
   * seeding fixtures: `signedInPage.request` runs in the browser context and
   * does not share the in-memory access token the Angular app keeps.
   */
  apiRequest: APIRequestContext;
  /** Hook for tests to swap which user to sign in as. */
  testUser: TestUser;

  /**
   * A freshly-registered user, unique per test. Use whenever a test depends on
   * a clean ledger (empty state, exact count assertions). The user is created
   * by hitting POST /api/v1/oauth/register with a randomized email + passcode.
   */
  freshUser: TestUser;
  /** Browser page signed in as `freshUser`. */
  freshSignedInPage: Page;
  /** APIRequestContext authenticated as `freshUser`. */
  freshApiRequest: APIRequestContext;
};

export const test = base.extend<AppFixtures>({
  testUser: [primaryUser, { option: true }],

  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  dashboardPage: async ({ page }, use) => use(new DashboardPage(page)),
  loansPage: async ({ page }, use) => use(new LoansPage(page)),
  billsPage: async ({ page }, use) => use(new BillsPage(page)),
  addLoanDialog: async ({ page }, use) => use(new AddLoanDialogPage(page)),
  recordPaymentDialog: async ({ page }, use) => use(new RecordPaymentDialogPage(page)),
  logBillPaymentDialog: async ({ page }, use) => use(new LogBillPaymentDialogPage(page)),
  editLoanPage: async ({ page }, use) => use(new EditLoanPage(page)),
  calendarPage: async ({ page }, use) => use(new CalendarPage(page)),
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

  freshUser: async ({ baseURL }, use) => {
    const suffix = Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
    const email = `e2e-${suffix}@example.com`;
    const passcode = 'FreshPasscode!1';
    const ctx = await playwrightRequest.newContext({ baseURL });
    try {
      const resp = await ctx.post('/api/v1/oauth/register', {
        data: { email, password: passcode },
      });
      if (!resp.ok()) {
        throw new Error(
          `freshUser fixture: register failed (status ${resp.status()}, body ${await resp.text()})`,
        );
      }
    } finally {
      await ctx.dispose();
    }
    await use({ email, passcode, counterpartyName: 'Friend' });
  },

  freshSignedInPage: async ({ page, freshUser }, use) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.signIn(freshUser.email, freshUser.passcode);
    await expect(page).toHaveURL(/\/dashboard$/);
    await use(page);
  },

  freshApiRequest: async ({ baseURL, freshUser }, use) => {
    const tokenCtx = await playwrightRequest.newContext({ baseURL });
    try {
      const tokenResp = await tokenCtx.post('/api/v1/oauth/token', {
        data: {
          grant_type: 'password',
          email: freshUser.email,
          password: freshUser.passcode,
        },
      });
      if (!tokenResp.ok()) {
        throw new Error(
          `freshApiRequest fixture: failed to obtain OAuth token (status ${tokenResp.status()})`,
        );
      }
      const body = (await tokenResp.json()) as { access_token: string };
      const ctx = await playwrightRequest.newContext({
        baseURL,
        extraHTTPHeaders: { Authorization: `Bearer ${body.access_token}` },
      });
      try {
        await use(ctx);
      } finally {
        await ctx.dispose();
      }
    } finally {
      await tokenCtx.dispose();
    }
  },

  apiRequest: async ({ baseURL, testUser }, use) => {
    // Use a dedicated APIRequestContext so the bearer token is attached for
    // every call. The OAuth password grant runs against the same baseURL the
    // browser sees, so the request hits the Angular dev server which proxies
    // /api/v1/* to the real API.
    const tokenCtx = await playwrightRequest.newContext({ baseURL });
    try {
      const tokenResp = await tokenCtx.post('/api/v1/oauth/token', {
        data: {
          grant_type: 'password',
          email: testUser.email,
          password: testUser.passcode,
        },
      });
      if (!tokenResp.ok()) {
        throw new Error(
          `apiRequest fixture: failed to obtain OAuth token (status ${tokenResp.status()})`,
        );
      }
      const body = (await tokenResp.json()) as { access_token: string };
      const ctx = await playwrightRequest.newContext({
        baseURL,
        extraHTTPHeaders: { Authorization: `Bearer ${body.access_token}` },
      });
      try {
        await use(ctx);
      } finally {
        await ctx.dispose();
      }
    } finally {
      await tokenCtx.dispose();
    }
  },
});

export { expect };
