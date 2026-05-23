# Plan: Convert combined add-entry dialog to three single-purpose dialogs

## Goal

Replace the one tablist-based `AddEntryDialogComponent` (Loan / Bill payment / Payment in) with three independent dialogs that match `docs/mocks/add-loan.html`, `add-bill.html`, `add-payment.html`. Drive the work via ATDD: every behaviour change starts as a failing Playwright e2e written against new page-object models.

## Target shape (from mocks)

| Dialog | Title | Amount label | Save label | Fields | Trace |
|---|---|---|---|---|---|
| `AddLoanDialogComponent` | "Add a loan" | "Amount lent" | "Save loan" | amount, description (required), date, method, note | L2-007 |
| `LogBillPaymentDialogComponent` | "Log a bill payment" | "Amount paid" | "Save bill payment" | amount, description (required), date, method | L2-013 AC3 |
| `RecordPaymentDialogComponent` | "Record a payment" | "Amount received" | "Record payment" | amount, date, method | L2-016 |

No tablist anywhere; the title in the dialog header IS the disambiguator.

## Spec changes (do first; tests trace to these)

1. **`docs/specs/L2.md` L2-007 AC1**: drop "the 'Loan' segment shall be selected"; keep "amount input shall auto-focus". Title is "Add a loan".
2. **L2-013**: add an AC for the "Log a bill payment" dialog shape (title, amount label, fields, save label, no segmented control).
3. **L2-016**: clarify the dialog title is "Record a payment" and there's no mode selector.
4. **L2-007 / L2-016**: drop the `/add?mode=…` URL framing (the dialog is opened from in-app actions; the route stays only as a deep link if it already exists).

## ATDD sequence (each step: red test → implementation → green)

Each test lives under `C:\projects\tab\e2e\` with the `// Traces to: L2-NNN` header, uses fixtures from `e2e/fixtures/app-fixtures.ts`, and a new POM under `e2e/pages/`.

### Step 1 — POMs (no implementation yet)

Create three POMs replacing `e2e/pages/add-entry.page.ts`:

- `e2e/pages/add-loan-dialog.page.ts` — `AddLoanDialogPage`
- `e2e/pages/log-bill-payment-dialog.page.ts` — `LogBillPaymentDialogPage`
- `e2e/pages/record-payment-dialog.page.ts` — `RecordPaymentDialogPage`

Each POM:

- Locates by `data-testid="add-loan-dialog"` / `log-bill-payment-dialog` / `record-payment-dialog`.
- Exposes typed field locators (`amountInput`, `dateInput`, etc.), `saveButton` named by mock-correct label, `cancelButton`, error/hint locators.
- Has no `segment(...)` method.
- Exposes `fill(values)` + `save()` helpers.

Register them in `e2e/fixtures/app-fixtures.ts` alongside existing page fixtures. **Delete** `AddEntryPage` and its `segment` / `selectSegment` / `openFor` helpers.

### Step 2 — Failing test: Add a loan (L2-007)

Rewrite the loan-add cases in `e2e/tests/loans.spec.ts`:

- Trigger `dashboardPage.addLoanButton.click()` (or `loansPage.addLoanCta.click()`).
- Assert `addLoanDialogPage.dialog` is visible.
- Assert there is **no** `tablist` named "Entry type" anywhere on the page.
- Assert title text "Add a loan" and amount label "Amount lent".
- Drive `fillLoan(...)`, `save()`, then check the new ledger row.

### Step 3 — Implementation: `AddLoanDialogComponent`

- New component under `frontend/projects/components/src/lib/add-loan-dialog/`.
- Templated after the existing `add-entry-dialog.component.html` but stripped to loan-only fields and copy.
- Export `openAddLoanDialog(dialog, { submit })` helper (no `mode` field on data).
- Re-export from `components` public API.
- Keep validation (amount > 0, date ≤ today) inline; lift the two predicates into `add-entry-dialog/validation.ts` if they need to be shared.
- Update `dashboard.page.ts` and `loans.page.ts` to call `openAddLoanDialog` (no mode arg) when the user invokes "Add a loan".

### Step 4 — Failing test: Record a payment (L2-016)

`e2e/tests/payments.spec.ts`:

- Trigger from the dashboard's "Record a payment" action (and from `/loans` if mocks place it there).
- Assert `recordPaymentDialogPage.dialog` visible, title "Record a payment", amount label "Amount received", save label "Record payment".
- No `description` field, no `note` field.
- Fill amount + method, save, assert balance decreased.

### Step 5 — Implementation: `RecordPaymentDialogComponent`

- New component under `…/components/src/lib/record-payment-dialog/`.
- `openRecordPaymentDialog(dialog, { submit })`.
- Dashboard / loans call sites switched to it.

### Step 6 — Failing test: Log a bill payment (L2-013 AC3)

Add a new `e2e/tests/bill-log-payment.spec.ts` (or extend `bills.spec.ts`):

- Trigger from the bill card's "Log this month" action.
- Assert `logBillPaymentDialogPage.dialog` visible, title "Log a bill payment", amount label "Amount paid", save label "Save bill payment".
- Confirms description is present, note is absent.
- Save, assert a `bill-split` ledger entry was created with the entered amount (per L2-013 AC3).

### Step 7 — Implementation: `LogBillPaymentDialogComponent`

- New component under `…/components/src/lib/log-bill-payment-dialog/`.
- `openLogBillPaymentDialog(dialog, { recurringBillId, period, submit })` so the caller passes the bill context; the dialog just collects amount/date/method/description.
- Wire it up wherever "Log this month" is currently implemented in `bills.page.ts`.

### Step 8 — Delete the old dialog

After all callers are migrated and all tests green:

- Delete `frontend/projects/components/src/lib/add-entry-dialog/` (component + helper).
- Remove the export from `components/src/public-api.ts`.
- Confirm `SegmentedComponent` is still exported (loans filter still uses it).
- Verify no remaining `AddEntryDialog…` references with `grep -r AddEntryDialog frontend/`.

### Step 9 — Validation gate

Run from `backend/`:

- `./build.ps1 build` (Angular libs build clean via `ship` task)
- `./build.ps1 traces` (every new spec file has the `// Traces to: L2-NNN` header)
- `./build.ps1 lint:fe` (public-surface + structure)
- `./build.ps1 e2e` (Playwright suite green end-to-end)

## File-level inventory

### Add

- `frontend/projects/components/src/lib/add-loan-dialog/{component.ts,.html,.scss,index.ts}`
- `frontend/projects/components/src/lib/record-payment-dialog/{…}`
- `frontend/projects/components/src/lib/log-bill-payment-dialog/{…}`
- `e2e/pages/add-loan-dialog.page.ts`
- `e2e/pages/record-payment-dialog.page.ts`
- `e2e/pages/log-bill-payment-dialog.page.ts`

### Modify

- `frontend/projects/components/src/public-api.ts` (export new dialogs, drop old)
- `frontend/projects/tab/src/app/pages/dashboard/dashboard.page.ts`
- `frontend/projects/tab/src/app/pages/loans/loans.page.ts`
- `frontend/projects/tab/src/app/pages/bills/bills.page.ts` (Log this month → new dialog)
- `e2e/fixtures/app-fixtures.ts` (register new POMs, drop AddEntryPage fixture)
- `e2e/tests/loans.spec.ts`, `e2e/tests/payments.spec.ts`, `e2e/tests/bills.spec.ts` (or new `bill-log-payment.spec.ts`)
- `docs/specs/L2.md` (L2-007, L2-013, L2-016 wording per "Spec changes" above)

### Delete

- `frontend/projects/components/src/lib/add-entry-dialog/` (whole folder)
- `e2e/pages/add-entry.page.ts`

## Risks / open decisions

1. **Bill-log entry point**: the mocks call this from a bill card action (`"Log this month"`). If `bills.page.ts` doesn't yet have that affordance wired, Step 6's test will need a UI hook added first. Inspect when arriving at that step and surface before implementing.
2. **Shared dialog chrome**: header / footer / panel CSS is identical across all three. Factor the common styles into one shared `dialog-shell.scss` partial (mixin) imported by each `.scss` to avoid 3x duplication, but do NOT create a runtime base component — keep each dialog standalone.
3. **L2-007 AC1 still says "Loan segment shall be selected"** — confirm whether to edit the spec rather than preserve the segment for backwards compatibility. (Plan assumes yes.)
