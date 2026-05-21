// Acceptance Test
// Traces to: L2-022
// Description: CSV export of the full ledger.

import { test, expect } from '../fixtures/app-fixtures';

test.describe('L2-022 — CSV export', () => {
  test('AC1: download yields tab-statement-{yyyy-mm-dd}.csv with the expected header row', async ({
    signedInPage,
    settingsPage,
  }) => {
    await settingsPage.goto();

    const [download] = await Promise.all([
      signedInPage.waitForEvent('download'),
      settingsPage.exportButton.click(),
    ]);

    expect(download.suggestedFilename()).toMatch(/^tab-statement-\d{4}-\d{2}-\d{2}\.csv$/);

    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(chunk as Buffer);
    const content = Buffer.concat(chunks).toString('utf-8');
    const [header] = content.split(/\r?\n/);
    expect(header).toBe('date,type,description,total_amount,counterparty_share,method,note');
  });

  test('AC2: descriptions containing commas or quotes are RFC 4180 escaped', async ({
    signedInPage,
    settingsPage,
  }) => {
    await settingsPage.goto();

    const [download] = await Promise.all([
      signedInPage.waitForEvent('download'),
      settingsPage.exportButton.click(),
    ]);

    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(chunk as Buffer);
    const content = Buffer.concat(chunks).toString('utf-8');

    const offendingLines = content
      .split(/\r?\n/)
      .slice(1)
      .filter((line) => /[",]/.test(line));

    for (const line of offendingLines) {
      expect(line).toMatch(/"[^"]*("")?[^"]*"/);
    }
  });
});
