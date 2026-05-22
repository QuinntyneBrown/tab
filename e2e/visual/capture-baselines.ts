// Captures baseline screenshots of every docs/mocks/*.html at three viewports.
// Output: e2e/visual/baselines/<page>-<viewport>.png.
// Usage: from repo root, `npx tsx e2e/visual/capture-baselines.ts`
// (requires @playwright/test browsers installed via `npm run install:browsers`).

import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const repoRoot = resolve(__dirname, '..', '..');
const mocksDir = join(repoRoot, 'docs', 'mocks');
const baselinesDir = join(__dirname, 'baselines');

import { viewports } from '../fixtures/viewports';

const pages = ['login', 'dashboard', 'loans', 'bills', 'statement', 'settings', 'add'] as const;
const captureViewports = [
  { name: 'xs', width: viewports.XS.width, height: viewports.XS.height },
  { name: 'm', width: viewports.M.width, height: viewports.M.height },
  { name: 'xl', width: viewports.XL.width, height: viewports.XL.height },
] as const;

async function main(): Promise<void> {
  await mkdir(baselinesDir, { recursive: true });
  const browser = await chromium.launch();
  try {
    for (const name of pages) {
      const mockPath = join(mocksDir, `${name}.html`);
      const url = pathToFileURL(mockPath).toString();
      for (const vp of captureViewports) {
        const context = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
          deviceScaleFactor: 1,
        });
        const page = await context.newPage();
        await page.goto(url, { waitUntil: 'networkidle' });
        const out = join(baselinesDir, `${name}-${vp.name}.png`);
        await mkdir(dirname(out), { recursive: true });
        await page.screenshot({ path: out, fullPage: false });
        await context.close();
        console.log(`captured ${out}`);
      }
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
