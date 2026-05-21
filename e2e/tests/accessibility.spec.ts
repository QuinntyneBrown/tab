// Acceptance Test
// Traces to: L2-031, L2-032, L2-033
// Description: Keyboard navigation, color contrast, semantic structure & SR labels.

import { test, expect } from '../fixtures/app-fixtures';

function relativeLuminance(rgb: { r: number; g: number; b: number }): number {
  const toLin = (c: number) => {
    const sc = c / 255;
    return sc <= 0.03928 ? sc / 12.92 : Math.pow((sc + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLin(rgb.r) + 0.7152 * toLin(rgb.g) + 0.0722 * toLin(rgb.b);
}

function parseRgb(value: string): { r: number; g: number; b: number } {
  const match = value.match(/(\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return { r: 255, g: 255, b: 255 };
  return { r: Number(match[1]), g: Number(match[2]), b: Number(match[3]) };
}

function contrast(fg: string, bg: string): number {
  const l1 = relativeLuminance(parseRgb(fg));
  const l2 = relativeLuminance(parseRgb(bg));
  const [lighter, darker] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (lighter + 0.05) / (darker + 0.05);
}

test.describe('L2-031 — Keyboard navigation', () => {
  test('AC1: tab order matches visual reading order on /dashboard', async ({
    signedInPage,
    dashboardPage,
  }) => {
    await dashboardPage.goto();

    const focusedYs: number[] = [];
    for (let i = 0; i < 8; i++) {
      await signedInPage.keyboard.press('Tab');
      const box = await signedInPage.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return null;
        const r = el.getBoundingClientRect();
        return { x: r.x, y: r.y };
      });
      if (box) focusedYs.push(box.y);
    }

    expect(focusedYs.length).toBeGreaterThan(2);
    const sorted = [...focusedYs].sort((a, b) => a - b);
    expect(focusedYs).toEqual(sorted);
  });

  test('AC2: focused elements show a visible 2px outline', async ({
    signedInPage,
    dashboardPage,
  }) => {
    await dashboardPage.goto();
    await signedInPage.keyboard.press('Tab');

    const outline = await signedInPage.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el) return null;
      const cs = getComputedStyle(el);
      return {
        outlineWidth: cs.outlineWidth,
        outlineStyle: cs.outlineStyle,
        outlineOffset: cs.outlineOffset,
        outlineColor: cs.outlineColor,
      };
    });
    expect(outline).not.toBeNull();
    expect(parseFloat(outline!.outlineWidth)).toBeGreaterThanOrEqual(2);
    expect(outline!.outlineStyle).not.toBe('none');
  });

  test('AC3: focus is trapped within a modal and returned on close', async ({
    signedInPage,
    billsPage,
  }) => {
    await billsPage.goto();
    await billsPage.newBillButton.click();

    const dialog = signedInPage.getByRole('dialog');
    await expect(dialog).toBeVisible();

    for (let i = 0; i < 12; i++) {
      await signedInPage.keyboard.press('Tab');
      const insideDialog = await signedInPage.evaluate(
        () =>
          !!document.activeElement?.closest('[role="dialog"]'),
      );
      expect(insideDialog).toBe(true);
    }

    await signedInPage.keyboard.press('Escape');
    await expect(dialog).toBeHidden();

    const focusedAfterClose = await signedInPage.evaluate(
      () => (document.activeElement as HTMLElement | null)?.textContent ?? '',
    );
    expect(focusedAfterClose).toMatch(/\+\s*new/i);
  });
});

test.describe('L2-032 — Color contrast', () => {
  test('AC1: primary text on base background meets WCAG AA', async ({
    signedInPage,
    dashboardPage,
  }) => {
    await dashboardPage.goto();
    const colors = await dashboardPage.heroAmount.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { fg: cs.color, bg: cs.backgroundColor || getComputedStyle(document.body).backgroundColor };
    });
    const ratio = contrast(colors.fg, colors.bg);
    expect(ratio).toBeGreaterThanOrEqual(3); // hero is large text
  });

  test('AC2: muted text is only used on text ≥18px (or 14px bold)', async ({
    signedInPage,
    dashboardPage,
  }) => {
    await dashboardPage.goto();
    const violations = await signedInPage.evaluate(() => {
      const out: string[] = [];
      document.querySelectorAll('.muted, [data-muted="true"]').forEach((el) => {
        const cs = getComputedStyle(el);
        const size = parseFloat(cs.fontSize);
        const weight = parseInt(cs.fontWeight, 10);
        const isLarge = size >= 18 || (size >= 14 && weight >= 700);
        if (!isLarge) out.push(`${(el as HTMLElement).innerText.slice(0, 40)} (${size}px ${weight})`);
      });
      return out;
    });
    expect(violations).toEqual([]);
  });
});

test.describe('L2-033 — Semantic structure & screen-reader labels', () => {
  test('AC1: bottom nav is a navigation landmark with named tabs and current-page announcement', async ({
    signedInPage,
    appShell,
    dashboardPage,
  }) => {
    await dashboardPage.goto();
    await expect(appShell.bottomNav).toBeVisible();

    for (const name of ['Home', 'Loans', 'Bills', 'Settings'] as const) {
      await expect(appShell.navTab(name)).toBeVisible();
    }
    await expect(appShell.activeTab()).toHaveAccessibleName(/home/i);
  });

  test('AC2: hero balance has an aria-label spelling out the amount', async ({
    signedInPage,
    dashboardPage,
  }) => {
    await dashboardPage.goto();
    const ariaLabel = await dashboardPage.heroAmount.getAttribute('aria-label');
    expect(ariaLabel).toMatch(/dollars?/i);
    expect(ariaLabel).toMatch(/cents?/i);
  });
});
