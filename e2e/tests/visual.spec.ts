// Acceptance Test
// Traces to: L2-028, L2-029, L2-030
// Description: Pixel-parity guardrail — every page matches its docs/mocks/<page>.html baseline at XS/M/XL within 1%.

import { test, expect } from '../fixtures/app-fixtures';
import { viewports } from '../fixtures/viewports';

interface PageUnderTest {
  name: string;
  path: string;
  requiresAuth: boolean;
}

const pagesUnderTest: PageUnderTest[] = [
  { name: 'login', path: '/login', requiresAuth: false },
  { name: 'dashboard', path: '/dashboard', requiresAuth: true },
  { name: 'loans', path: '/loans', requiresAuth: true },
  { name: 'bills', path: '/bills', requiresAuth: true },
  { name: 'statement', path: '/statement', requiresAuth: true },
  { name: 'settings', path: '/settings', requiresAuth: true },
  { name: 'add', path: '/add?mode=loan', requiresAuth: true },
];

const viewportEntries: { name: keyof typeof viewports; width: number; height: number }[] = [
  { name: 'XS', width: viewports.XS.width, height: viewports.XS.height },
  { name: 'M', width: viewports.M.width, height: viewports.M.height },
  { name: 'XL', width: viewports.XL.width, height: viewports.XL.height },
];

for (const pg of pagesUnderTest) {
  test.describe(`visual parity — ${pg.name}`, () => {
    for (const vp of viewportEntries) {
      test(`${pg.name} matches mock at ${vp.name}`, async ({ page, signedInPage }) => {
        const target = pg.requiresAuth ? signedInPage : page;
        await target.setViewportSize({ width: vp.width, height: vp.height });
        await target.goto(pg.path);
        await target
          .locator('[data-ready]')
          .first()
          .waitFor({ state: 'attached', timeout: 5_000 })
          .catch(() => target.waitForLoadState('networkidle'));
        await expect(target).toHaveScreenshot(`${pg.name}-${vp.name.toLowerCase()}.png`, {
          maxDiffPixelRatio: 0.01,
        });
      });
    }
  });
}
