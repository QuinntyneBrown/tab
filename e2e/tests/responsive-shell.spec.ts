// Acceptance Test
// Traces to: L2-028, L2-029, L2-030
// Description: Responsive app shell, fluid typography, bill-grid breakpoints.

import { test, expect } from '../fixtures/app-fixtures';
import { viewports } from '../fixtures/viewports';

test.describe('L2-028 — Mobile-first layout shell', () => {
  test('AC1: at XS, no horizontal scroll, tap targets ≥44px, bottom nav visible', async ({
    signedInPage,
    appShell,
    dashboardPage,
    page,
  }) => {
    await page.setViewportSize(viewports.XS);
    await dashboardPage.goto();

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);

    await expect(appShell.bottomNav).toBeVisible();

    const tabs = appShell.bottomNav.getByRole('link');
    const count = await tabs.count();
    for (let i = 0; i < count; i++) {
      const box = await tabs.nth(i).boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeGreaterThanOrEqual(44);
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('AC2: at L+, bottom nav is replaced by a 240px sidebar; content capped at 1200px', async ({
    signedInPage,
    appShell,
    dashboardPage,
    page,
  }) => {
    await page.setViewportSize(viewports.L);
    await dashboardPage.goto();

    await expect(appShell.bottomNav).toBeHidden();
    await expect(appShell.sidebar).toBeVisible();

    const sidebarBox = await appShell.sidebar.boundingBox();
    expect(Math.round(sidebarBox!.width)).toBe(240);

    const main = page.getByRole('main');
    const mainBox = await main.boundingBox();
    expect(mainBox!.width).toBeLessThanOrEqual(1200);
  });

  test('AC3: layout changes are driven by CSS only — no JS layout switching', async ({
    signedInPage,
    appShell,
    dashboardPage,
    page,
  }) => {
    await dashboardPage.goto();

    await page.addInitScript(() => {
      (window as unknown as { __resizeListeners: number }).__resizeListeners = 0;
      const original = window.addEventListener.bind(window);
      window.addEventListener = ((type: string, ...rest: unknown[]) => {
        if (type === 'resize')
          (window as unknown as { __resizeListeners: number }).__resizeListeners += 1;
        return (original as (...args: unknown[]) => void)(type, ...rest);
      }) as typeof window.addEventListener;
    });

    await page.setViewportSize(viewports.XS);
    await page.setViewportSize(viewports.L);

    const resizeListeners = await page.evaluate(
      () => (window as unknown as { __resizeListeners?: number }).__resizeListeners ?? 0,
    );
    expect(resizeListeners).toBe(0);
  });
});

test.describe('L2-029 — Fluid typography and spacing', () => {
  test('AC1–AC2: hero balance font-size clamps between 48 px (at 320 px) and 88 px (at XL)', async ({
    signedInPage,
    dashboardPage,
    page,
  }) => {
    await dashboardPage.goto();

    await page.setViewportSize({ width: 320, height: 700 });
    const minSize = parseFloat(
      await dashboardPage.heroAmount.evaluate((el) => getComputedStyle(el).fontSize),
    );
    expect(minSize).toBeGreaterThanOrEqual(48);

    await page.setViewportSize(viewports.XL);
    const maxSize = parseFloat(
      await dashboardPage.heroAmount.evaluate((el) => getComputedStyle(el).fontSize),
    );
    expect(maxSize).toBeLessThanOrEqual(88);
  });

  test('AC3: hero balance font-size interpolates smoothly across widths (no stepping)', async ({
    signedInPage,
    dashboardPage,
    page,
  }) => {
    await dashboardPage.goto();

    const sizes: number[] = [];
    for (const w of [360, 600, 820, 1100, 1440]) {
      await page.setViewportSize({ width: w, height: 800 });
      sizes.push(
        parseFloat(
          await dashboardPage.heroAmount.evaluate((el) => getComputedStyle(el).fontSize),
        ),
      );
    }

    for (let i = 1; i < sizes.length; i++) {
      expect(sizes[i]).toBeGreaterThanOrEqual(sizes[i - 1]);
    }
    const uniqueSizes = new Set(sizes);
    expect(uniqueSizes.size).toBeGreaterThan(2);
  });
});

test.describe('L2-030 — Bill grid responsiveness', () => {
  const cases: Array<{ name: 'XS' | 'M' | 'XL'; cols: number }> = [
    { name: 'XS', cols: 1 },
    { name: 'M', cols: 2 },
    { name: 'XL', cols: 3 },
  ];

  for (const { name, cols } of cases) {
    test(`bill grid is ${cols}-col at ${name}`, async ({ signedInPage, billsPage, page }) => {
      await page.setViewportSize(viewports[name]);
      await billsPage.goto();

      const columns = await page.evaluate(() => {
        const grid = document.querySelector('[data-testid="bills-grid"]');
        return grid ? getComputedStyle(grid).gridTemplateColumns.split(' ').length : 0;
      });
      expect(columns).toBe(cols);
    });
  }
});
