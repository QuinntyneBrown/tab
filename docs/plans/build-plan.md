# Tab — End-to-End Build Plan

A vertically-sliced, ATDD-driven plan to take `tab` from its current partial scaffold to a complete, production-grade application running against real SQL Server, the real .NET API, and the real Angular UI — with **pixel-perfect visual parity** against the mocks in `docs/mocks/`.

> **Source of truth.** Requirements live in `docs/specs/L1.md` and `docs/specs/L2.md`. The mocks in `docs/mocks/*.html` are the visual contract. The failing Playwright tests in `e2e/tests/*.spec.ts` are the executable contract. **A task is "done" only when its failing tests turn green and its visual-parity screenshots match the mock at every viewport.**

---

## 0. Principles (apply to every task)

1. **Vertical slices, ATDD-first.** Each task is one user-visible capability sliced top-to-bottom: DB → handler → controller → api-library service → page composition → e2e green.
2. **Failing test first.** Before writing code, the failing Playwright spec for the slice must already exist in `e2e/tests/`. If it doesn't, add it as step 0 of the task. Verify it red, then implement until green.
3. **Real stack, no mocks at the edge.** Tests hit a running Angular app talking HTTPS to the running .NET API, which reads/writes to real SQL Server (LocalDB in dev/CI). No MSW, no in-memory DB substitutes for acceptance/e2e tests.
4. **Library boundaries are non-negotiable** (L2-035 / L2-040 / L2-041):
   - `projects/api` — TypeScript interfaces, `InjectionToken<T>` exports, DTO models, and concrete `HttpClient`-backed services. **The only place HTTP is called.**
   - `projects/components` — presentation components. **No HTTP, no Router, no api-lib services.** Inputs (signal inputs) in, outputs out.
   - `projects/tab` — application shell only: routing, guards, interceptors, providers, and **page components that compose `@tab/components` and consume `@tab/api`**. No reusable UI lives here.
5. **One public type per file** in both stacks (L2-037 / L2-045). Templates and styles in their own files (`*.component.html`, `*.component.scss`); no inline templates/styles.
6. **Signals, not RxJS** for state (L2-039). HTTP results are converted to signals at the api-library boundary via `toSignal()` / `httpResource` style services.
7. **Pixel-perfect visual parity.** Every page-level slice ends with a Playwright **screenshot diff** vs. a baseline captured from the corresponding `docs/mocks/*.html` at XS/M/XL. Tolerance: `maxDiffPixelRatio: 0.01`. Tokens, spacing, typography, radii, opacity all match.
8. **No temp code.** No "TODO", no placeholder responses, no stubbed implementations left at the end of a task. If a feature isn't done, the task isn't done.
9. **Radically simple.** Smallest code that makes the test pass. No premature abstraction, no speculative interfaces, no helper layers introduced "for later".
10. **Traceability headers.** Every new test file (.cs or .spec.ts) opens with `// Traces to: L2-XXX[, L2-YYY]`.

---

## 1. Current status snapshot (2026-05-21)

**Done**
- Solution layout (Domain / Application / Infrastructure / Api / Api.Contracts / Cli) + Directory.Packages.props.
- All domain entities, EF configurations, initial migration, `ITabDbContext`, `TabDbContext`.
- Auth slice end-to-end on backend: `IPasswordHasher` (Argon2id), `IJwtIssuer` (RS256), `ITokenService` (rotation), `IssueToken/RefreshToken/RevokeToken/RegisterUser` commands, `OAuthController`, `MeController`.
- API plumbing: `CorrelationIdMiddleware`, `SecurityHeadersMiddleware`, `ExceptionHandlingMiddleware`, `LoggingBehavior`, `ValidationBehavior`.
- Backend application code for counterparty, preferences, loans CRUD, ledger list, bills (create/update/archive/list/posting math) — **but not yet wired through controllers in every case**; verify per slice.
- `Tab.Cli` host with `db migrate/reset/seed`, `users create/list/delete/reset-passcode/seed`, `import loans`.
- Angular workspace with three projects; all presentation primitives + composition components scaffolded under `projects/components`; mock-parity HTML/SCSS files added.
- Playwright e2e harness with page objects + fixtures + 12 spec files covering every L2 area. **All red.**

**Not done (the rest of this document)**
- Wire every backend controller listed in L2-049 (`PaymentsController`, `BillsController` + postings endpoint, `BalanceController`, `DashboardController`, `StatementController` + share, `SharedStatementController`, `ExportController`). Confirm `CounterpartyController`, `PreferencesController`, `LoansController` cover all verbs.
- Rate limiting on `/oauth/token` (L2-025).
- The entire `@tab/api` runtime: interfaces, injection tokens, concrete `Http*Service` implementations, models, `provide…()` factories, an `authInterceptor`, a `correlationIdInterceptor`, the route guard, the silent-refresh flow.
- The entire `projects/tab` application: routes, guards, providers wiring, and one page per screen in `docs/mocks/`.
- Visual-parity test infrastructure (baseline capture from `docs/mocks/*.html`, `toHaveScreenshot` specs per page per viewport).
- CI: `build.ps1 e2e` target, Playwright in CI, screenshot-baseline storage, performance smoke (L2-026).

---

## 2. Architecture invariants (re-state because they bind every slice)

### Backend (.NET)
- Controller actions are ≤ 5 lines: bind → `_mediator.Send(cmd, ct)` → `ActionResult<T>`. No `if`, no try/catch (global filter handles it), no data access.
- Handlers depend on `ITabDbContext` (never `TabDbContext`). No repositories. Use `.AsNoTracking()` on reads. EF Core LINQ direct.
- `CurrentUser` is a scoped service derived from the `sub` claim. Every handler that touches user data filters by `CurrentUser.Id`.
- Validators are FluentValidation, one per command, registered via assembly scan. `ValidationBehavior` converts failures to RFC 7807.
- Time is read via `TimeProvider` (BCL). Tests inject `FakeTimeProvider`.
- Every endpoint sits under `/api/v1/...`. Errors are `application/problem+json` (L2-046).

### Frontend (Angular)
- The **tab** app has only: `app.config.ts`, `app.routes.ts`, route guard(s), HTTP interceptor(s), `provideTabApi()` wiring, and page components under `projects/tab/src/app/pages/<route>/`. **No UI components are defined in `projects/tab`.**
- Each page is `*.page.ts` + `*.page.html` + `*.page.scss`. The class composes elements from `@tab/components`, reads signals from `@tab/api` services, and emits commands back through those services.
- `@tab/api` exposes per-domain modules: each module ships `IXxxService` interface, `XXX_SERVICE` `InjectionToken<IXxxService>`, DTO models (one file per type), and a `provideXxxService()` factory binding token → concrete `HttpXxxService`. Public surface re-exports interface + token + models + factory only — never the concrete class.
- BEM-only CSS in components (L2-038). Tokens from `projects/components/src/lib/base.scss`; no hard-coded colors in components.
- Routing uses Angular `Routes`, lazy-loaded pages. Route guard: `authGuard` (functional `CanActivateFn`) reads the in-memory access token; on miss attempts silent refresh; on failure redirects to `/login?returnUrl=...`.
- Tokens (access + refresh) live in memory (not `localStorage`). Refresh is via httpOnly cookie set by the backend on token issue (L2-001 AC4).

---

## 3. Task template

Every numbered task below is structured as:

```
### Task N — <Slice name>
Traces to: L2-AAA, L2-BBB
Failing e2e: e2e/tests/<file>.spec.ts (describe <name>)

Backend:
  - Files added/edited (paths)
  - Endpoints exposed
  - Acceptance tests added/extended (paths)
Frontend api lib:
  - Interface(s), token(s), model(s), concrete service file paths
Frontend components lib:
  - Already shipped — confirm via existing exports, or add new files if a gap is found
Frontend tab app (pages only):
  - Page files (*.page.ts/.html/.scss)
  - Route entries / guard touches
Visual parity:
  - Baseline html + screenshot spec (path)
Done when:
  - All listed e2e tests + backend acceptance tests green
  - Screenshot diff ≤ 1% at XS/M/XL
```

If a sub-step is "n/a" for a slice, omit it — don't fabricate work to fill the template.

---

## 4. Slices (execute in order)

### Task 1 — Confirm baseline build + e2e harness boots
Traces to: L2-050
Failing e2e: any (`auth.spec.ts` AC1) used as smoke

- Run `./build.ps1 build` → backend builds.
- Run `ng build api && ng build components && ng build tab` → all green.
- Run `cd e2e && npm install && npm run install:browsers && npm test -- --grep "AC1: unauthenticated"` → confirms framework wiring; expected red because `/login` route does not exist yet.
- Capture baseline mock screenshots: add `e2e/visual/capture-baselines.ts` that opens each `docs/mocks/*.html` in Playwright at viewports XS (375×812), M (768×1024), XL (1440×900), saves to `e2e/visual/baselines/<page>-<viewport>.png`. Commit baselines.
- Add `build.ps1 e2e` target that starts the API + Angular dev server + runs `playwright test`.

Done when: a single `./build.ps1 e2e -- --grep "smoke"` command runs the full stack and reports test results.

---

### Task 2 — Visual-parity guardrail per page
Traces to: L1-018 (foundation for screenshot tests)
Failing e2e: n/a (infra)

- Add `e2e/tests/visual.spec.ts` with one `describe` per page (`login`, `dashboard`, `loans`, `bills`, `statement`, `settings`, `add`). Each `describe` has three tests (XS/M/XL) that:
  1. Navigate to the page (signed in if protected — use `signedInPage` fixture).
  2. Wait for a `data-ready` attribute the page sets after first paint.
  3. `await expect(page).toHaveScreenshot('login-xl.png', { maxDiffPixelRatio: 0.01 });`
- Initially every test fails (pages don't exist). They turn green incrementally per slice.
- Add `--update-snapshots` documentation to `e2e/README.md`.

Done when: the file exists, runs, and reports clear failures naming each missing page.

---

### Task 3 — Rate limiting on `/oauth/token`
Traces to: L2-025
Failing e2e: extend `e2e/tests/auth.spec.ts` with a `L2-025` describe

- Add `e2e/tests/auth.spec.ts` cases: six rapid wrong-credential POSTs to `/api/v1/oauth/token` for the same account → sixth returns `429` with `Retry-After`. Same for IP-keyed limiter across distinct emails.
- Backend: in `Program.cs` register `AddRateLimiter` with two fixed-window policies (`auth-account`, `auth-ip`). Apply both to `OAuthController.Token`.
- Acceptance test: `backend/tests/Tab.Api.AcceptanceTests/Auth/RateLimitTests.cs` — `// Traces to: L2-025`.

Done when: e2e + acceptance pass; manual `curl` confirms `Retry-After` header.

---

### Task 4 — `@tab/api`: auth service surface
Traces to: L2-001, L2-002, L2-003, L2-004, L2-036

Backend: already in place (`/oauth/token`, `/oauth/revoke`, `/me`).

Frontend api lib (`projects/api/src/lib/auth/`):
- `auth.models.ts` is split into one file per type:
  - `tokens.model.ts` — `Tokens { accessToken, expiresAt }`
  - `credentials.model.ts` — `Credentials { email, passcode }`
  - `me.model.ts` — `MeProfile { id, email, counterpartyName }`
- `i-auth.service.ts` — `IAuthService` interface (`signIn(c): Promise<MeProfile>`, `silentRefresh(): Promise<boolean>`, `signOut(): Promise<void>`, `accessToken: Signal<string|null>`, `me: Signal<MeProfile|null>`).
- `auth.token.ts` — `AUTH_SERVICE = new InjectionToken<IAuthService>('AUTH_SERVICE')`.
- `http-auth.service.ts` — concrete `HttpAuthService` implementing `IAuthService`. Uses `HttpClient`. Persists nothing in storage; access token lives in a writable signal. Refresh cookie set by backend.
- `provide-auth.ts` — `provideAuth()` factory returning `[{ provide: AUTH_SERVICE, useClass: HttpAuthService }]`.
- Public `index.ts` re-exports: `IAuthService`, `AUTH_SERVICE`, `MeProfile`, `Credentials`, `Tokens`, `provideAuth`.
- Unit tests under `projects/api/src/lib/auth/*.spec.ts` use `HttpTestingController` to assert wire format (`POST /api/v1/oauth/token` body shape, grant_type=password, refresh as cookie-only).

Frontend tab app:
- `projects/tab/src/app/auth/auth.guard.ts` — `authGuard: CanActivateFn` returning `true` when `accessToken()` set, else attempts `silentRefresh()`, else redirects to `/login?returnUrl=<url>`.
- `projects/tab/src/app/auth/auth.interceptor.ts` — appends `Authorization: Bearer <accessToken>` and `X-Correlation-Id: <uuid>` to outbound requests.
- `app.config.ts` wires `provideHttpClient(withInterceptors([authInterceptor]))`, `provideAuth()`, `provideRouter(routes)`.

Done when: a unit test signs in with seeded creds and `signedInPage` fixture lands on `/dashboard` placeholder.

---

### Task 5 — Login page (pixel-perfect)
Traces to: L2-001
Failing e2e: `e2e/tests/auth.spec.ts` → `L2-001`

Frontend tab app:
- `projects/tab/src/app/pages/login/login.page.ts` — composes `<tab-card>`, `<tab-input>`, `<tab-button>` from `@tab/components`. Calls `inject(AUTH_SERVICE).signIn(...)`. On success, navigates to `returnUrl` (`/dashboard` default). On 401, sets `formError = 'Email or passcode is incorrect.'` (generic, non-revealing per L2-001 AC5).
- `login.page.html` — markup matching `docs/mocks/login.html` exactly: same DOM order, same classes, same gutter behavior. Sets `data-ready` once mounted.
- `login.page.scss` — BEM, uses tokens from `base.scss`. At XS fills viewport (≥16 px gutter). At XL caps card at 480 px centered.
- Route `'/login'` added; **unprotected**.

Visual parity:
- `e2e/visual/baselines/login-xs.png`, `login-m.png`, `login-xl.png` captured from `docs/mocks/login.html`.
- `e2e/tests/visual.spec.ts` `login` describe goes green.

Done when: `auth.spec.ts` AC1–AC5 green at all viewports + visual screenshot diff ≤ 1%.

---

### Task 6 — Sign-out wiring through settings
Traces to: L2-004
Failing e2e: `e2e/tests/auth.spec.ts` → `L2-004`

Frontend tab app:
- `projects/tab/src/app/pages/settings/settings.page.ts` — minimal page that injects `AUTH_SERVICE` and renders a `<tab-button variant="ghost">Sign out</tab-button>` plus the rest of the settings shell (filled out in Task 21 — this task only needs sign-out present).
- On click: `await signOut()` (calls `POST /api/v1/oauth/revoke` with refresh token from cookie, clears in-memory access token).
- `auth.guard.ts` already redirects when token is missing.

Done when: `L2-004` AC1 and AC2 green; `L2-003 AC3` green.

---

### Task 7 — App shell with bottom nav (mobile) / left rail (desktop)
Traces to: L2-028, L2-029, L1-018, L1-022 (shell is a page-level composition of `<tab-app-shell>`)
Failing e2e: `e2e/tests/app-shell.spec.ts`, `e2e/tests/responsive-shell.spec.ts`

Frontend tab app:
- All protected pages render inside `<tab-app-shell>` (from `@tab/components`). The shell auto-switches mobile bottom nav ↔ desktop sidebar via CSS `:has()` per `docs/mocks/assets/css/base.css`.
- `routes`: parent route with `canActivate: [authGuard]` and `component: ShellLayoutComponent` (single file in `projects/tab/src/app/layout/shell-layout.component.ts` that just renders `<tab-app-shell><router-outlet/></tab-app-shell>` — this is shell composition, not reusable UI, so it stays in the app).
- Active-tab state derived from current URL via `inject(Router).events` → signal.

Visual parity:
- Baselines for shell chrome at XS/M/XL match `dashboard.html` (shell rendered with dashboard slot).
- `responsive-shell.spec.ts` confirms 44×44 px tap targets, no horizontal scroll, sidebar replaces bottom nav at L+.

Done when: `app-shell.spec.ts` + `responsive-shell.spec.ts` green.

---

### Task 8 — Counterparty (`/me` + `/counterparty`) end-to-end
Traces to: L2-006
Failing e2e: counterparty assertions inside `e2e/tests/counterparty.spec.ts` and `e2e/tests/preferences.spec.ts`

Backend: confirm `CounterpartyController` exposes `GET/PUT /api/v1/counterparty`; covered by `Tab.Api.AcceptanceTests/Counterparty/CounterpartyTests.cs`.

Frontend api lib (`projects/api/src/lib/counterparty/`):
- `counterparty.model.ts`, `i-counterparty.service.ts`, `counterparty.token.ts`, `http-counterparty.service.ts`, `provide-counterparty.ts`.
- Service exposes `counterparty: Signal<Counterparty|null>` (loaded on first access), `update(name): Promise<Counterparty>`.

Frontend tab app:
- Settings page (Task 21) reads/writes the name via `inject(COUNTERPARTY_SERVICE)`.
- Counterparty name appears in app shell header avatar — page passes signal value into `<tab-avatar name>`.

Done when: e2e counterparty tests + acceptance tests green.

---

### Task 9 — Preferences end-to-end
Traces to: L2-021
Failing e2e: `e2e/tests/preferences.spec.ts`

Backend: confirm `PreferencesController` exposes `GET/PUT /api/v1/preferences` with validator (currency ISO 4217, split 1–99, reminder 1–14, tone enum).

Frontend api lib (`projects/api/src/lib/preferences/`):
- Same five-file pattern. `IPreferencesService.preferences: Signal<Preferences>`, `update(p): Promise<Preferences>`.

Frontend tab app:
- Settings page wires the four controls. Currency change reflects across the app by reading `inject(PREFERENCES_SERVICE).preferences().currencyCode` in any page that renders money via `<tab-amount currency="...">`.
- Default split percentage propagates to the bill editor (Task 16).

Done when: `preferences.spec.ts` AC1–AC3 green.

---

### Task 10 — Loans: create (`POST /loans`) wired through Add Entry page
Traces to: L2-007
Failing e2e: `e2e/tests/loans.spec.ts` → `L2-007`

Backend: confirm `LoansController.Create` calls `CreateLoanCommand`; validator enforces amount > 0, description ≤ 280, date ≤ today (server time per `TimeProvider`), method ≤ 40, note ≤ 280. Acceptance test exists (`Loans/LoansTests.cs` — extend if missing AC4 future-date case).

Frontend api lib (`projects/api/src/lib/loans/`):
- `loan.model.ts`, `create-loan-request.model.ts`, `loan-type.enum.ts` (`'loan' | 'bill' | 'payment'`), `i-loans.service.ts`, `loans.token.ts`, `http-loans.service.ts`, `provide-loans.ts`.
- `ILoansService.create(req): Promise<Loan>`, signals filled in later tasks.

Frontend tab app:
- `projects/tab/src/app/pages/add-entry/add-entry.page.ts`:
  - Reads `?mode=loan|payment` from `ActivatedRoute`.
  - Composes `<tab-segmented>`, `<tab-amount-input>`, `<tab-input>` for description/method, native date input.
  - Disables Save while amount ≤ 0. Shows hint "Enter an amount greater than zero".
  - On save: calls `loansService.create(req)`. On success: `router.navigate(['../', { /* whatever the caller was */ }])` — for MVP use `history.back()` semantics; if there is no back history, default to `/dashboard`.
- Route `'/add'` (protected).

Visual parity: baseline from `docs/mocks/add.html` at XS/M/XL.

Done when: `L2-007` AC1–AC5 + visual diff pass.

---

### Task 11 — Ledger list (`GET /loans?month=&type=`) with month grouping
Traces to: L2-008
Failing e2e: `e2e/tests/loans.spec.ts` → `L2-008`

Backend: confirm `LoansController.List` calls `ListLedgerQuery` which returns a discriminated `LedgerEntryResponse[]` (loan|bill|payment) grouped server-side or pre-sorted by date desc. Add per-month aggregate (sum of signed amounts) to the response so the FE doesn't recompute.

Frontend api lib:
- `loans-list-request.model.ts` (filter + month), `month-group.model.ts`, `ILoansService.list(filter): Signal<MonthGroup[]>` (use `toSignal()` over the `HttpClient` observable; loading and error are sibling signals).

Frontend tab app:
- `projects/tab/src/app/pages/loans/loans.page.ts` — composes `<tab-month-section>` per group, `<tab-ledger>` of `<tab-ledger-row>` per entry, summary strip, filter `<tab-segmented>` (Loans/Bills/Payments/All).
- Empty state via `<tab-empty>` linking to `/add?mode=loan`.
- Two-column grid at L (CSS only, `data-testid="month-grid"` on the wrapper).

Visual parity: baselines from `docs/mocks/loans.html`.

Done when: `L2-008` AC1–AC4 + visual diff pass.

---

### Task 12 — Loan: view, edit, delete
Traces to: L2-009, L2-010
Failing e2e: `e2e/tests/loans.spec.ts` → `L2-009`, `L2-010`

Backend: confirm `LoansController` has `GET/{id}`, `PUT/{id}`, `DELETE/{id}`. Add an acceptance test covering: cross-user fetch returns 404 (L2-005 AC1) — required to satisfy ledger isolation guarantee.

Frontend api lib: extend `ILoansService` with `get(id)`, `update(id, req)`, `remove(id)`.

Frontend tab app:
- Route `/loans/:id/edit` reuses `AddEntryPage` in "edit" mode (component decides via route param). Pre-populates inputs from `loansService.get(id)`.
- Delete button opens a `<tab-card role="dialog">` confirm sheet (focus-trapped, returns focus on close per L2-031 AC3). Confirm wires to `remove(id)` then navigates back.
- If the deleted entry's date falls within a shared statement's window, fetch a flag from `/loans/{id}` (server returns `usedInSharedStatement: boolean`) and surface the warning copy. Operation still proceeds.

Done when: `L2-009` + `L2-010` green.

---

### Task 13 — Payment-in end-to-end
Traces to: L2-016
Failing e2e: `e2e/tests/payments.spec.ts`

Backend:
- Add `Tab.Application/Payments/CreatePaymentCommand[.cs|Handler.cs|Validator.cs]` (amount > 0; date ≤ today; method ≤ 40; note ≤ 280).
- Add `PaymentsController` with `POST /api/v1/payments`. Returns the created payment as a `PaymentResponse` (in `Tab.Api.Contracts/Payments/`).
- Acceptance test `Tab.Api.AcceptanceTests/Payments/PaymentsTests.cs` — `// Traces to: L2-016` covers AC1 and AC2 (balance can go negative).

Frontend api lib (`projects/api/src/lib/payments/`): five-file module, `IPaymentsService.create(req)`.

Frontend tab app:
- `AddEntryPage` already routes on `?mode=payment`. Payment branch hides description (optional in MVP — show "Method" only) per `docs/mocks/add.html`. Calls `paymentsService.create`. On save: balance recomputes on next dashboard load.
- Ledger row rendering treats `type === 'payment'` with leading `−` and muted styling — verify the existing `<tab-ledger-row>` already handles the variant; if not, add the modifier to the components lib's row stylesheet.

Done when: `payments.spec.ts` green.

---

### Task 14 — Recurring bills: list, create, edit, archive
Traces to: L2-011, L2-012, L2-014, L2-015
Failing e2e: `e2e/tests/bills.spec.ts` → `L2-011`, `L2-012`, `L2-014`, `L2-015`

Backend:
- Confirm `Tab.Application/Bills/CreateBillCommand`, `UpdateBillCommand`, `ArchiveBillCommand`, `ListBillsQuery` exist; ensure handlers return `BillResponse` with computed `NextDueDate` and `SharePreview = ExpectedAmount * SplitPercent / 100`.
- Add `BillsController`: `GET`, `POST`, `PUT/{id}`, `DELETE/{id}` (archive). Each action one line through MediatR.
- Validator: name required ≤ 60; vendor ≤ 60; expected > 0; due day 1–28; split 1–99 inclusive.
- Acceptance tests `Tab.Api.AcceptanceTests/Bills/BillsTests.cs` cover CRUD + edit-doesn't-rewrite-history + archive-keeps-postings.

Frontend api lib (`projects/api/src/lib/bills/`): full module, `IBillsService.list(): Signal<Bill[]>`, `create/update/archive`.

Frontend tab app:
- `projects/tab/src/app/pages/bills/bills.page.ts` — grid of `<tab-bill-card>` from `@tab/components`. Default split for new bills comes from `PREFERENCES_SERVICE.preferences().defaultSplitPercent`.
- `projects/tab/src/app/pages/bills/bill-editor.page.ts` — full-screen form for create/edit at `/bills/new` and `/bills/:id/edit`.

Visual parity: baselines from `docs/mocks/bills.html`. 1/2/3 columns at XS/M/XL respectively (L2-030).

Done when: bills CRUD tests + visual diff pass.

---

### Task 15 — Mark bill paid → automatic posting
Traces to: L2-013
Failing e2e: `e2e/tests/bills.spec.ts` → `L2-013`

Backend:
- Add `Tab.Application/Bills/CreateBillPostingCommand[.cs|Handler.cs|Validator.cs]`.
- Handler computes `ShareAmount = round(ActualTotal × SplitPercent / 100, 2, MidpointRounding.ToEven)` — bankers' rounding to match `BillMath.cs` (verify; if `BillMath` uses HalfUp adjust spec language and acceptance test). Persists `BillPosting`. Unique `(BillId, Period)` constraint on the EF model ⇒ DB conflict surfaces as `DuplicatePostingException` → 409 ProblemDetails.
- Endpoint `POST /api/v1/bills/{id}/postings` body `{ period: 'YYYY-MM', date?: 'YYYY-MM-DD', actualTotal?: decimal }`. Acceptance test `Tab.Api.AcceptanceTests/Bills/BillPostingTests.cs` covers L2-013 AC1–AC3.

Frontend api lib: `IBillsService.markPaid(id, period, actualTotal?)`.

Frontend tab app:
- `<tab-bill-card>` already has "Mark paid in full" and "Log this month" actions. The page wires both. Optimistic UI update on success; on 409 the page surfaces the "Period already recorded" copy.
- Balance and dashboard refresh on next navigation (the balance signal is invalidated on mutating calls — see Task 17).

Done when: `L2-013` AC1–AC3 + visual states pass.

---

### Task 16 — Balance endpoint and signal
Traces to: L2-017
Failing e2e: assertions inside `e2e/tests/balance-and-dashboard.spec.ts`

Backend:
- Add `Tab.Application/Balance/GetBalanceQuery` + handler. Single SQL round-trip computing `SUM(loans.Amount) + SUM(billPostings.ShareAmount) - SUM(payments.Amount)` filtered by `UserId`. Return `BalanceResponse { Amount, AsOf, Currency }`.
- `BalanceController.Get → GET /api/v1/balance`.
- Acceptance test verifying exact `1284.50` for the seeded scenario.

Frontend api lib (`projects/api/src/lib/balance/`):
- `IBalanceService.balance: Signal<Balance|null>`, plus an `invalidate(): void` that triggers re-fetch. Loans/bills/payments services call `BALANCE_SERVICE.invalidate()` after mutating operations (cross-service signalling stays inside the api lib — pages don't know).

Done when: balance assertion in `balance-and-dashboard.spec.ts` and acceptance test pass.

---

### Task 17 — Dashboard composite endpoint and page
Traces to: L2-018
Failing e2e: `e2e/tests/balance-and-dashboard.spec.ts`

Backend:
- `Tab.Application/Dashboard/GetDashboardQuery` + handler. Composes balance, last 6 ledger entries, current-month summary (lent, bills, paid back, net), upcoming bill (if any within `Preferences.ReminderDays`). Aim for ≤ 4 SQL round-trips total.
- `DashboardController.Get → GET /api/v1/dashboard`. Acceptance test asserts response shape; integration test asserts query count via EF command interceptor (`Tab.Infrastructure.IntegrationTests/DashboardQueryCountTests.cs`).

Frontend api lib (`projects/api/src/lib/dashboard/`): `IDashboardService.dashboard: Signal<Dashboard|null>` + `refresh()`.

Frontend tab app:
- `projects/tab/src/app/pages/dashboard/dashboard.page.ts` — composes `<tab-stat-card>` hero, optional `<tab-nudge>` for upcoming bill (omitted when none), `<tab-section-head>` + `<tab-ledger>` for recent activity, monthly summary grid. Quick actions wire to `/add?mode=loan` and `/add?mode=payment`.
- Hero font-size scales fluidly `clamp(48px, 8vw, 88px)` (L2-029 AC1/AC2).

Visual parity: baselines from `docs/mocks/dashboard.html`.

Done when: `balance-and-dashboard.spec.ts` AC1–AC5 + visual diff pass.

---

### Task 18 — Statement view
Traces to: L2-019
Failing e2e: `e2e/tests/statement.spec.ts` → `L2-019`

Backend:
- `Tab.Application/Statement/GetStatementQuery` + handler. Inputs: `from`, `to` (defaults: `to = today`, `from = first-of-month of earliest entry`). Returns chronological entries + running totals + final balance (must equal `GET /balance` for same window).
- `StatementController.Get → GET /api/v1/statement`.
- Acceptance test verifies print-CSS contract via header presence (the FE-only part validated by Playwright `emulateMedia({ media: 'print' })`).

Frontend api lib (`projects/api/src/lib/statement/`): `IStatementService.fetch(from?, to?): Signal<Statement|null>`.

Frontend tab app:
- `projects/tab/src/app/pages/statement/statement.page.ts` — composes `<tab-totals>`/`<tab-totals-row>` and `<tab-ledger>`/`<tab-ledger-row>`. Date-range picker uses two native date inputs.
- Print stylesheet at `statement.page.scss` `@media print { ... }` hides header and action bar, fits A4/Letter.

Visual parity: baselines from `docs/mocks/statement.html`.

Done when: `L2-019` AC1–AC4 + visual diff pass.

---

### Task 19 — Shareable statement link
Traces to: L2-020
Failing e2e: `e2e/tests/statement.spec.ts` → `L2-020`

Backend:
- `Tab.Application/Statement/CreateStatementShareCommand` + handler. Mints 256-bit random token, stores `SHA-256(token)` in `StatementShare` with `ExpiresUtc = now + 14d` (use `TimeProvider`). Returns the full URL (with token) exactly once.
- `Tab.Application/Statement/GetSharedStatementQuery` + handler — anonymous, takes token, hashes, looks up, returns 404 if missing or expired.
- `StatementController.Share → POST /api/v1/statement/share` (auth required).
- `SharedStatementController.Get → GET /api/v1/shared/{token}` (no auth; explicit `AllowAnonymous`).
- Acceptance tests cover happy path, expired link, and "no PII beyond statement fields".

Frontend api lib:
- `IStatementService.share(from, to): Promise<{ url, expiresAt }>`.
- New module `projects/api/src/lib/shared-statement/` exposing `ISharedStatementService.fetchByToken(token)` (uses an unauthenticated `HttpClient` so the auth interceptor does NOT attach the bearer header — implement via a separate `HttpClient` instance or interceptor skip flag).

Frontend tab app:
- Statement page: "Share" button → calls `share()`, copies URL to clipboard, shows toast.
- New route `/share/:token` rendered by `projects/tab/src/app/pages/shared-statement/shared-statement.page.ts`. This route is **unguarded** and **outside** the shell layout. Renders read-only statement (composes `<tab-totals>` and `<tab-ledger>`). Expired → renders "This statement is no longer available."

Visual parity: re-uses statement baseline; separate baseline for the "expired" state.

Done when: `L2-020` AC1–AC3 + visual diff pass.

---

### Task 20 — CSV export
Traces to: L2-022
Failing e2e: `e2e/tests/export.spec.ts`

Backend:
- `Tab.Application/Export/ExportLedgerCsvQuery` + handler. Streams CSV with columns `date,type,description,total_amount,counterparty_share,method,note`. RFC 4180 quoting.
- `ExportController.Get → GET /api/v1/export.csv` returns `text/csv; charset=utf-8`, `Content-Disposition: attachment; filename="tab-statement-{yyyy-MM-dd}.csv"`.
- Acceptance test: descriptions containing `,` and `"` are quoted correctly; header row present; row count matches ledger count.

Frontend tab app:
- Settings page: "Export all entries" button triggers download via `<a href="/api/v1/export.csv" download>` with `Authorization` header — since native `<a>` won't send it, instead `fetch` with bearer, get a blob, `URL.createObjectURL`, click a hidden `<a>` programmatically. Implementation lives in `pages/settings/export.helper.ts` (private helper, not exported beyond settings page).

Done when: `export.spec.ts` AC1–AC2 green.

---

### Task 21 — Settings page (complete composition)
Traces to: L2-006, L2-021, L2-022, L2-004
Failing e2e: `e2e/tests/preferences.spec.ts` (any leftover preference cases) + visual

Frontend tab app:
- `projects/tab/src/app/pages/settings/settings.page.ts` composes:
  - Counterparty name `<tab-input>` (wired in Task 8).
  - Currency selector (`<tab-input type="select">` or native `<select>` — keep simple).
  - Default split `<tab-input type="number">` 1–99.
  - Reminder lead time `<tab-input type="number">` 1–14.
  - Statement tone radio (only "Neutral" in MVP — render disabled with hint).
  - Export button (Task 20).
  - Sign-out button (Task 6).

Visual parity: baselines from `docs/mocks/settings.html`.

Done when: settings visual diff pass.

---

### Task 22 — Accessibility pass
Traces to: L2-031, L2-032, L2-033
Failing e2e: `e2e/tests/accessibility.spec.ts`

- Add `@axe-core/playwright` and run `AxeBuilder` on every page (signed in). Zero violations of `wcag2aa` rules.
- Verify focus order, focus-visible outline `2px rgba(180,180,188,0.55)` 2 px offset (component-library global style).
- Verify the hero balance has an `aria-label` reading "Counterparty owes $X" (assemble from currency + amount via `Intl.NumberFormat`).
- Verify nav landmarks (`<nav aria-label="primary">`, `aria-current="page"` on the active tab).
- Trap focus inside the delete-confirm dialog (Task 12) and the share-link toast.

Done when: `accessibility.spec.ts` green at XS/M/XL.

---

### Task 23 — Responsive shell + grid breakpoints
Traces to: L2-028, L2-029, L2-030
Failing e2e: `e2e/tests/responsive-shell.spec.ts`

This is a sweep: every page's CSS uses tokens and breakpoints from `projects/components/src/lib/base.scss`. No JS-driven layout. Bottom-nav replaced by 240 px sidebar at L+ via `:has(tab-nav)` in `base.scss`. Bills grid 1/2/3 cols at XS/M/XL. Loans 1/2 cols at XS-M/L.

Done when: `responsive-shell.spec.ts` green across all three viewports.

---

### Task 24 — Performance verification
Traces to: L2-026, L2-027
Failing e2e: n/a (perf smoke run separately)

- Add `tests/perf/dashboard-loadtest.csx` (NBomber) seeding 10 000 ledger entries for one user, asserting p95 ≤ 300 ms for `/api/v1/dashboard` and `/api/v1/loans?month=2026-05` over 100 sequential calls.
- Add Lighthouse CI step to `build.ps1 perf` running against `/dashboard` with 4G throttle. Budgets: FCP ≤ 1500 ms, LCP ≤ 2000 ms, initial-route JS ≤ 200 KB gzip.
- Add `.AsNoTracking()` and confirm `(UserId, Date DESC)` indexes are hit (capture once in `Tab.Infrastructure.IntegrationTests/DashboardIndexUsageTests.cs` using `MARS` and `dm_db_index_usage_stats`).

Done when: perf script runs green on CI hardware.

---

### Task 25 — Final sweep: traceability, cleanup, polish
Traces to: L2-051, L1-028
Failing e2e: lint

- Add `build.ps1 lint` step that:
  - Greps every `*.spec.ts` and `*.cs` test file for `Traces to:` in the first 10 lines; fails CI on missing header.
  - Greps the `Traces to:` references against `docs/specs/L2.md` headings; fails on unknown ID.
- Remove every TODO, `xtest`, `test.skip`, hard-coded localhost outside config.
- Confirm `projects/tab` source tree contains only: `app.config.ts`, `app.routes.ts`, `main.ts` (+ `.server` siblings), `auth/`, `layout/shell-layout.component.ts`, and `pages/<route>/*`. No component-like files outside `pages/`. CI lint script `build.ps1 lint:tab-app-structure` walks the tree and fails on violations.
- Verify `@tab/api` public surface exports interface + token + models + factory only per service module — concrete `Http*Service` classes are NOT exported. Add an automated check in `projects/api/scripts/check-public-surface.ts`.
- Run the entire e2e suite (`./build.ps1 e2e`) headless on Chromium-desktop, Mobile-Chrome, Webkit-desktop. All green.
- Update root `README.md` with run instructions and `CLAUDE.md` with build/test/run commands per the project's stated next steps.

Done when: every L2 has at least one passing acceptance and/or e2e test; one command (`./build.ps1 ship`) runs build + unit + acceptance + e2e + a11y + visual parity and exits 0.

---

## 5. Definition of done (whole-app)

The app is **complete** when:

1. Every L2 in `docs/specs/L2.md` has at least one passing acceptance test (.cs) or e2e test (.spec.ts) whose `Traces to:` header references it. CI lint enforces this mapping.
2. Every screen in `docs/mocks/*.html` has a corresponding page under `projects/tab/src/app/pages/<route>/` with screenshot-diff ≤ 1% at XS (375), M (768), XL (1440).
3. `projects/tab` contains **no UI components other than pages** (and the trivial shell-layout wrapper). Lint enforces.
4. `projects/components` contains no `HttpClient`, no `Router`, no `@tab/api` imports outside DTO model re-exports. Lint enforces.
5. `projects/api` exports only interfaces, tokens, models, and `provide…()` factories. Lint enforces.
6. The full stack — Angular dev/prod build, .NET API, real SQL Server (LocalDB) — boots and serves the e2e suite green.
7. `./build.ps1 ship` exits 0 and prints a coverage report: every L2 → tests → pass.
8. There is no temporary code, no TODO/HACK/FIXME comments, no stubbed responses, and no commented-out blocks.

---

## 6. Risks and how this plan addresses them

| Risk | Mitigation |
|---|---|
| Visual parity drifts as components evolve. | Baselines captured from the mocks (not from the running app). Any change to a component that changes pixels requires re-baselining with explicit `--update-snapshots` and a commit message. |
| Tab application gradually accretes UI logic that belongs in components. | Lint script in Task 25 walks `projects/tab` for non-page UI and fails CI. Reviewers reject anything outside `pages/`, `auth/`, `layout/shell-layout.component.ts`, and root config files. |
| Tests pass against in-memory fakes but fail against real SQL. | Acceptance and e2e tests run against real LocalDB and real API. No InMemory provider for acceptance-level coverage. |
| Auth flows tested only on happy path. | Rate-limit, refresh rotation, silent refresh, sign-out, and cross-user 404 each have a dedicated test. |
| Performance budget isn't measured until launch. | Task 24 runs perf smoke on CI hardware; budgets fail the build. |
| Share-link feature leaks data. | Tokens stored as SHA-256 hashes only; URLs returned once; anonymous endpoint cannot enumerate; 14-day expiry; acceptance tests cover expired + missing cases. |

---

## 7. Execution discipline

- One task per branch / one commit per task is preferred when changes are small enough; otherwise split commits within the task by layer (db → handler → controller → api-lib → page → tests) so review is reading-order.
- Do not start task N+1 until task N is green and merged. Carrying multiple in-flight slices defeats vertical-slicing.
- If a task surfaces a missing requirement, update `docs/specs/L2.md` first, then add the test, then code. Never sneak silent behavior in.
