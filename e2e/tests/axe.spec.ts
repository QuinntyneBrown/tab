// Acceptance Test
// Traces to: L2-031, L2-032, L2-033
// Description: WCAG 2 AA scan on every protected page using @axe-core/playwright.

import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '../fixtures/app-fixtures';

interface ScannedPage {
  name: string;
  path: string;
  protected: boolean;
}

const pages: ScannedPage[] = [
  { name: 'login', path: '/login', protected: false },
  { name: 'dashboard', path: '/dashboard', protected: true },
  { name: 'loans', path: '/loans', protected: true },
  { name: 'bills', path: '/bills', protected: true },
  { name: 'statement', path: '/statement', protected: true },
  { name: 'settings', path: '/settings', protected: true },
  { name: 'add', path: '/add?mode=loan', protected: true },
];

for (const pg of pages) {
  test.describe(`axe — ${pg.name}`, () => {
    test(`no WCAG 2 AA violations on ${pg.name}`, async ({ page, signedInPage }) => {
      const target = pg.protected ? signedInPage : page;
      await target.goto(pg.path);
      await target.waitForLoadState('networkidle');
      const result = await new AxeBuilder({ page: target })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();
      expect(result.violations, JSON.stringify(result.violations, null, 2)).toEqual([]);
    });
  });
}
