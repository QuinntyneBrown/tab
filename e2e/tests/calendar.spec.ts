// Acceptance Test
// Traces to: L2-052, L2-053, L2-054, L2-055, L2-056, L2-057, L2-058
// Description: Calendar screen — unified month grid + agenda view over loans,
// payments, and posted/projected bill splits.

import { test, expect } from '../fixtures/app-fixtures';

test.describe('L2-052 — Calendar screen', () => {
  test('AC0 (smoke): authenticated user can land on /calendar and see the month grid shell', async ({
    signedInPage,
    calendarPage,
  }) => {
    await calendarPage.goto();
    await expect(calendarPage.heading(1, /Calendar/i)).toBeVisible();
    await expect(calendarPage.monthGrid).toBeVisible();
    await expect(calendarPage.weekdayHeader).toContainText(/Sun.*Mon.*Tue.*Wed.*Thu.*Fri.*Sat/s);
    await expect(calendarPage.monthLabel).toHaveText(/May 2026/);
  });
});

test.describe('L2-056 — Calendar in primary navigation', () => {
  test('AC3: navigating to /calendar gives the Calendar nav link aria-current="page"', async ({
    signedInPage,
    calendarPage,
  }) => {
    await calendarPage.goto();
    const link = signedInPage.locator('tab-nav a[data-k="calendar"]');
    await expect(link).toHaveAttribute('aria-current', 'page');
  });

  test('AC1/AC2: Calendar is reachable from the primary nav on /dashboard', async ({
    signedInPage,
    dashboardPage,
  }) => {
    await dashboardPage.goto();
    const link = signedInPage.locator('tab-nav a[data-k="calendar"]');
    await expect(link).toBeVisible();
    await link.click();
    await expect(signedInPage).toHaveURL(/\/calendar$/);
  });
});

test.describe('L2-052 — Today indicator and empty state', () => {
  test('AC1: today\'s cell carries data-today="true" and matches today\'s ISO date', async ({
    freshSignedInPage,
    calendarPage,
  }) => {
    await calendarPage.goto();
    const todayCell = calendarPage.todayCell();
    await expect(todayCell).toBeVisible();

    const expectedIso = new Date().toISOString().slice(0, 10);
    await expect(todayCell).toHaveAttribute('data-date', expectedIso);
  });

  test('AC6: empty banner appears for an account with no entries and no bills, and the grid is still rendered', async ({
    freshSignedInPage,
    calendarPage,
  }) => {
    await calendarPage.goto();
    await expect(calendarPage.emptyBanner).toBeVisible();
    await expect(calendarPage.emptyBanner).toContainText(/No activity yet/i);
    // Grid is still rendered (per L2-052 AC6).
    await expect(calendarPage.monthGrid).toBeVisible();
  });
});

test.describe('L2-052 — Posted entries render as typed chips', () => {
  test('AC2: cell renders one chip per posted entry, ordered loan → bill → payment', async ({
    freshSignedInPage,
    calendarPage,
    freshApiRequest,
  }) => {
    const date = '2026-05-15';

    // Seed a loan and a payment for the same date.
    const loanResp = await freshApiRequest.post('/api/v1/loans', {
      data: { amount: 58.2, date, description: 'Groceries' },
    });
    expect(loanResp.status()).toBeLessThan(300);

    const paymentResp = await freshApiRequest.post('/api/v1/payments', {
      data: { amount: 25, date, method: 'cash' },
    });
    expect(paymentResp.status()).toBeLessThan(300);

    // Seed a recurring bill with due day = 15 and mark this month's posting paid.
    const billResp = await freshApiRequest.post('/api/v1/bills', {
      data: { name: 'Hydro-test', expectedAmount: 168, dueDay: 15, splitPercent: 50 },
    });
    expect(billResp.status()).toBeLessThan(300);
    const bill = (await billResp.json()) as { id: string };
    const postingResp = await freshApiRequest.post(`/api/v1/bills/${bill.id}/postings`, {
      data: { period: '2026-05', actualTotal: 168, date },
    });
    expect(postingResp.status()).toBeLessThan(300);

    await calendarPage.gotoMonth('2026-05');

    // Three chips total on that cell, in loan → bill → payment order.
    await expect(calendarPage.cellChips(date)).toHaveCount(3);
    await expect(calendarPage.cellChipsOfType(date, 'loan')).toHaveCount(1);
    await expect(calendarPage.cellChipsOfType(date, 'bill')).toHaveCount(1);
    await expect(calendarPage.cellChipsOfType(date, 'payment')).toHaveCount(1);

    const orderedTypes = await calendarPage
      .cellChips(date)
      .evaluateAll((els) => els.map((e) => e.getAttribute('data-chip-type')));
    expect(orderedTypes).toEqual(['loan', 'bill', 'payment']);
  });
});

test.describe('L2-052/L2-055 — Projected bill postings', () => {
  test('AC3: a recurring bill with no posting for the current month renders a projected chip on the due date', async ({
    freshSignedInPage,
    calendarPage,
    freshApiRequest,
  }) => {
    const billResp = await freshApiRequest.post('/api/v1/bills', {
      data: { name: 'Hydro-projected', expectedAmount: 168, dueDay: 25, splitPercent: 50 },
    });
    expect(billResp.status()).toBeLessThan(300);

    await calendarPage.gotoMonth('2026-05');

    const projected = calendarPage.cellChipsOfType('2026-05-25', 'projected');
    await expect(projected).toHaveCount(1);
    await expect(projected.first()).toContainText('$84.00');
  });

  test('AC4: a bill posting for the current month suppresses any projection for that same month', async ({
    freshSignedInPage,
    calendarPage,
    freshApiRequest,
  }) => {
    const billResp = await freshApiRequest.post('/api/v1/bills', {
      data: { name: 'Hydro-dedup', expectedAmount: 168, dueDay: 25, splitPercent: 50 },
    });
    expect(billResp.status()).toBeLessThan(300);
    const bill = (await billResp.json()) as { id: string };
    const postingResp = await freshApiRequest.post(`/api/v1/bills/${bill.id}/postings`, {
      data: { period: '2026-05', actualTotal: 168 },
    });
    expect(postingResp.status()).toBeLessThan(300);

    await calendarPage.gotoMonth('2026-05');

    // Find the cell holding the posted bill (the posting's date — we don't
    // know precisely which day the handler uses, so assert across the month).
    const projectedAnywhere = calendarPage.monthGrid.locator('[data-chip-type="projected"]');
    await expect(projectedAnywhere).toHaveCount(0);

    const billAnywhere = calendarPage.monthGrid.locator('[data-chip-type="bill"]');
    await expect(billAnywhere).toHaveCount(1);
  });
});

test.describe('L2-052 — +N more overflow', () => {
  test('AC5: a cell with more than three chips truncates to three and shows a "+N more" affordance; activating it reveals all chips', async ({
    freshSignedInPage,
    calendarPage,
    freshApiRequest,
  }) => {
    const date = '2026-05-10';
    for (let i = 0; i < 5; i++) {
      const resp = await freshApiRequest.post('/api/v1/loans', {
        data: { amount: 10 + i, date, description: `Loan-${i}` },
      });
      expect(resp.status()).toBeLessThan(300);
    }

    await calendarPage.gotoMonth('2026-05');

    await expect(calendarPage.cellChips(date)).toHaveCount(3);
    const more = calendarPage.cellMoreLink(date);
    await expect(more).toBeVisible();
    await expect(more).toContainText('+2 more');

    await more.click();
    await expect(calendarPage.cellChips(date)).toHaveCount(5);
  });
});

test.describe('L2-054 — Chip activation', () => {
  test('AC1: activating a loan chip navigates to /loans/{id}/edit', async ({
    freshSignedInPage,
    calendarPage,
    freshApiRequest,
  }) => {
    const date = '2026-05-08';
    const loanResp = await freshApiRequest.post('/api/v1/loans', {
      data: { amount: 42, date, description: 'Snacks' },
    });
    expect(loanResp.status()).toBeLessThan(300);
    const loan = (await loanResp.json()) as { id: string };

    await calendarPage.gotoMonth('2026-05');
    await calendarPage.cellChipsOfType(date, 'loan').first().click();
    await expect(freshSignedInPage).toHaveURL(new RegExp(`/loans/${loan.id}/edit`));
  });

  test('AC4: activating a projected chip marks the bill paid and the chip turns into a posted-bill chip', async ({
    freshSignedInPage,
    calendarPage,
    freshApiRequest,
  }) => {
    const billResp = await freshApiRequest.post('/api/v1/bills', {
      data: { name: 'Hydro-mark', expectedAmount: 200, dueDay: 24, splitPercent: 50 },
    });
    expect(billResp.status()).toBeLessThan(300);

    await calendarPage.gotoMonth('2026-05');
    const projected = calendarPage.cellChipsOfType('2026-05-24', 'projected');
    await expect(projected).toHaveCount(1);

    await projected.first().click();

    // The mark-paid call refreshes the calendar; the projected chip is replaced
    // by a posted bill chip on the same date.
    await expect(calendarPage.cellChipsOfType('2026-05-24', 'projected')).toHaveCount(0);
    await expect(calendarPage.cellChipsOfType('2026-05-24', 'bill')).toHaveCount(1);
  });
});

test.describe('L2-053 — Month navigation and URL sync', () => {
  test('AC1: Previous month updates URL and label', async ({
    freshSignedInPage,
    calendarPage,
  }) => {
    await calendarPage.gotoMonth('2026-05');
    await expect(calendarPage.monthLabel).toHaveText(/May 2026/);

    await calendarPage.clickPrevMonth();
    await expect(freshSignedInPage).toHaveURL(/[?&]month=2026-04/);
    await expect(calendarPage.monthLabel).toHaveText(/April 2026/);
  });

  test('AC2: Today returns to the current month', async ({
    freshSignedInPage,
    calendarPage,
  }) => {
    await calendarPage.gotoMonth('2027-03');
    await calendarPage.clickToday();
    const expected = new Date().toISOString().slice(0, 7);
    await expect(freshSignedInPage).toHaveURL(new RegExp(`[?&]month=${expected}`));
  });

  test('AC3: deep link to a specific month renders that month', async ({
    freshSignedInPage,
    calendarPage,
  }) => {
    await calendarPage.gotoMonth('2027-01');
    await expect(calendarPage.monthLabel).toHaveText(/January 2027/);
  });

  test('AC5: browser back button restores prior month', async ({
    freshSignedInPage,
    calendarPage,
  }) => {
    await calendarPage.gotoMonth('2026-05');
    await calendarPage.clickNextMonth();
    await expect(calendarPage.monthLabel).toHaveText(/June 2026/);
    await freshSignedInPage.goBack();
    await expect(calendarPage.monthLabel).toHaveText(/May 2026/);
  });
});

test.describe('L2-053/L2-057 — Agenda view', () => {
  test('AC4: switching to agenda updates the URL and replaces the grid with the agenda', async ({
    freshSignedInPage,
    calendarPage,
  }) => {
    await calendarPage.gotoMonth('2026-05');
    await expect(calendarPage.monthGrid).toBeVisible();
    await calendarPage.switchTo('agenda');
    await expect(freshSignedInPage).toHaveURL(/[?&]view=agenda/);
    await expect(calendarPage.agenda).toBeVisible();
    await expect(calendarPage.monthGrid).toHaveCount(0);
  });

  test('AC: agenda renders one section per date that has at least one entry', async ({
    freshSignedInPage,
    calendarPage,
    freshApiRequest,
  }) => {
    const date = '2026-05-15';
    for (const desc of ['Loan-A', 'Loan-B']) {
      const r = await freshApiRequest.post('/api/v1/loans', {
        data: { amount: 25, date, description: desc },
      });
      expect(r.status()).toBeLessThan(300);
    }

    await calendarPage.gotoMonth('2026-05');
    await calendarPage.switchTo('agenda');

    await expect(calendarPage.agendaDay(date)).toBeVisible();
    await expect(calendarPage.agendaRows(date)).toHaveCount(2);
  });

  test('AC: Loans filter shows only loan rows', async ({
    freshSignedInPage,
    calendarPage,
    freshApiRequest,
  }) => {
    const date = '2026-05-12';
    const loan = await freshApiRequest.post('/api/v1/loans', {
      data: { amount: 30, date, description: 'Filter loan' },
    });
    expect(loan.status()).toBeLessThan(300);
    const payment = await freshApiRequest.post('/api/v1/payments', {
      data: { amount: 5, date, method: 'cash' },
    });
    expect(payment.status()).toBeLessThan(300);

    await calendarPage.gotoMonth('2026-05');
    await calendarPage.switchTo('agenda');
    await expect(calendarPage.agendaRows(date)).toHaveCount(2);

    await calendarPage.filterLoans.click();
    const loanRows = calendarPage.agenda.locator('[data-row-kind="loan"]');
    const paymentRows = calendarPage.agenda.locator('[data-row-kind="payment"]');
    await expect(loanRows).toHaveCount(1);
    await expect(paymentRows).toHaveCount(0);

    await calendarPage.filterAll.click();
    await expect(calendarPage.agendaRows(date)).toHaveCount(2);
  });
});

test.describe('L2-057 — Responsive shell', () => {
  test('AC2: at M the month grid is visible and cells meet the 96px minimum height', async ({
    freshSignedInPage,
    calendarPage,
  }) => {
    await freshSignedInPage.setViewportSize({ width: 800, height: 900 });
    await calendarPage.gotoMonth('2026-05');
    await expect(calendarPage.monthGrid).toBeVisible();

    const cell = calendarPage.cell('2026-05-15');
    const height = await cell.evaluate((el) => (el as HTMLElement).getBoundingClientRect().height);
    expect(height).toBeGreaterThanOrEqual(96);
  });

  test('AC2: at XL cell minimum height is 140px', async ({
    freshSignedInPage,
    calendarPage,
  }) => {
    await freshSignedInPage.setViewportSize({ width: 1440, height: 900 });
    await calendarPage.gotoMonth('2026-05');
    const cell = calendarPage.cell('2026-05-15');
    const height = await cell.evaluate((el) => (el as HTMLElement).getBoundingClientRect().height);
    expect(height).toBeGreaterThanOrEqual(140);
  });

  test('AC3: no horizontal overflow at any viewport', async ({
    freshSignedInPage,
    calendarPage,
  }) => {
    const widths = [360, 576, 768, 992, 1200, 1440];
    await calendarPage.goto();
    for (const w of widths) {
      await freshSignedInPage.setViewportSize({ width: w, height: 900 });
      const overflow = await freshSignedInPage.evaluate(() => {
        return document.documentElement.scrollWidth - document.documentElement.clientWidth;
      });
      expect(overflow, `viewport ${w}px should have no horizontal overflow`).toBeLessThanOrEqual(1);
    }
  });

  test('AC1: at XS the default view is agenda (no explicit ?view= param)', async ({
    freshSignedInPage,
    calendarPage,
  }) => {
    await freshSignedInPage.setViewportSize({ width: 360, height: 800 });
    await calendarPage.goto();
    await expect(calendarPage.agenda).toBeVisible();
    await expect(calendarPage.monthGrid).toHaveCount(0);
  });
});

test.describe('L2-055 — Calendar API composite endpoint', () => {
  test('AC1.empty: GET /api/v1/calendar returns empty entries and projections for a fresh account', async ({
    freshApiRequest,
  }) => {
    const resp = await freshApiRequest.get('/api/v1/calendar?from=2026-05-01&to=2026-05-31');
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body.entries).toEqual([]);
    expect(body.projections).toEqual([]);
  });

  test('AC2: range exceeding 366 days returns 400 problem+json', async ({ freshApiRequest }) => {
    const resp = await freshApiRequest.get('/api/v1/calendar?from=2025-01-01&to=2026-06-01');
    expect(resp.status()).toBe(400);
    expect(resp.headers()['content-type']).toContain('application/problem+json');
  });

  test('AC5: missing from returns 400', async ({ freshApiRequest }) => {
    const resp = await freshApiRequest.get('/api/v1/calendar?to=2026-05-31');
    expect(resp.status()).toBe(400);
  });
});
