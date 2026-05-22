/* UI audit helper: signs in and captures the four primary screens at desktop +
 * tablet + mobile. Used by claude/ui-audit to compare against docs/mocks. */
import { chromium } from '@playwright/test';

const pages = [
  { name: 'dashboard', path: '/dashboard' },
  { name: 'loans', path: '/loans' },
  { name: 'bills', path: '/bills' },
  { name: 'settings', path: '/settings' },
];

const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
];

(async () => {
  const b = await chromium.launch();
  for (const vp of viewports) {
    const ctx = await b.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await ctx.newPage();
    await page.goto('http://localhost:4200/login');
    await page.waitForLoadState('domcontentloaded');
    await page.getByLabel(/email/i).fill('quinntynebrown@gmail.com');
    await page.getByLabel(/passcode/i).fill('password12345');
    await page.getByRole('button', { name: /^sign in$/i }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    for (const pg of pages) {
      await page.goto('http://localhost:4200' + pg.path);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
      await page.screenshot({
        path: `C:/projects/tab/artifacts/${pg.name}-${vp.name}.png`,
        fullPage: true,
      });
      console.log(`OK ${pg.name}-${vp.name}`);
    }
    await ctx.close();
  }
  await b.close();
})();
