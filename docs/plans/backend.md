# Backend Implementation Plan

Concrete, phased plan to build the `tab` backend per the requirements in `docs/specs/L1.md` and `docs/specs/L2.md`. Every task names the L2 ID(s) it satisfies so acceptance tests can be written before code per L2-051.

---

## 0. Conventions (apply to every phase)

- **One public type per file** (L2-045). Filenames match the type name exactly. Folder layout mirrors the namespace.
- **Thin controllers** (L2-042). Action body ≤ 5 statements; only binds → `IMediator.Send` → returns `ActionResult<T>`.
- **Handlers depend on `ITabDbContext`** (L2-043), never on the concrete `TabDbContext`. No repository pattern (L2-044).
- **No business logic in controllers, EF entities, or DTOs.** Logic lives in MediatR handlers.
- **Async all the way down.** Every handler accepts and forwards `CancellationToken`.
- **No DateTime.Now / UtcNow inline.** Inject `TimeProvider` (or `IClock`) into every handler that reads time.
- **No `var` for primitives in domain code** (style) — readable types make spec mapping easier.
- **Public surface uses Problem Details** for errors (L2-046).
- **Every commit references an L2 ID** if it adds production code that satisfies a requirement.

---

## 1. Solution & project layout

```
src/
  Tab.Api/                     ASP.NET Core Web API host. Program.cs only.
  Tab.Api.Contracts/           DTOs, request/response models, error contracts shared with FE.
  Tab.Application/             MediatR requests + handlers + validators + abstractions (ITabDbContext lives here).
  Tab.Domain/                  Entities, value objects, domain exceptions. Pure C#, no EF references.
  Tab.Infrastructure/          EF Core, TabDbContext, migrations, JWT, password hasher, time provider, share-link signer.
tests/
  Tab.Api.AcceptanceTests/     End-to-end black-box tests over WebApplicationFactory<>. Every file has Traces-to header.
  Tab.Application.UnitTests/   Handler tests using ITabDbContext + InMemory or a sqlite-in-memory provider.
  Tab.Infrastructure.IntegrationTests/  Real-EF-against-LocalDB tests for migrations, indexes, schema.
build/
  build.ps1                    Single-command build/test/lint/format entrypoint (L2-050).
Tab.sln
```

**Why these projects:**
- `Tab.Domain` has no NuGet dependencies other than `System.*` — keeps domain tests fast and ensures we don't accidentally couple entities to EF.
- `Tab.Application` references `Tab.Domain` and depends only on `MediatR`, `FluentValidation`, and `Microsoft.EntityFrameworkCore` (just the abstractions; `ITabDbContext` exposes `DbSet<T>`). It does not reference `Tab.Infrastructure`.
- `Tab.Infrastructure` references `Tab.Application` and provides the concrete `TabDbContext`, the JWT signer, password hasher, time provider, etc.
- `Tab.Api` references `Tab.Application` and `Tab.Infrastructure` and is the composition root.
- `Tab.Api.Contracts` is intentionally separate so the Angular `@tab/api` library can generate clients off it (NSwag/Refit) without pulling in handlers.

---

## 2. NuGet dependencies (planned, by project)

| Project | Packages |
|---|---|
| `Tab.Api` | `Microsoft.AspNetCore.OpenApi`, `Swashbuckle.AspNetCore`, `Microsoft.AspNetCore.Authentication.JwtBearer`, `Microsoft.AspNetCore.RateLimiting` (built-in), `Serilog.AspNetCore`, `Serilog.Sinks.Console`, `Microsoft.EntityFrameworkCore.Design` |
| `Tab.Application` | `MediatR` (12.x — free), `FluentValidation`, `FluentValidation.DependencyInjectionExtensions`, `Microsoft.EntityFrameworkCore.Abstractions` |
| `Tab.Infrastructure` | `Microsoft.EntityFrameworkCore.SqlServer`, `Konscious.Security.Cryptography.Argon2` (for Argon2id), `System.IdentityModel.Tokens.Jwt`, `Microsoft.IdentityModel.Tokens` |
| `Tab.Domain` | none beyond BCL |
| Tests | `xunit`, `FluentAssertions`, `Microsoft.AspNetCore.Mvc.Testing`, `Microsoft.EntityFrameworkCore.InMemory` (selectively), `Respawn` (DB reset for integration tests), `Bogus` (fakes) |

---

## 3. Phased roadmap

Each phase ends with a verifiable exit criterion. Don't move on until the criterion passes.

### Phase 0 — Bootstrap (½ day)

**Tasks**
- Create solution + projects per §1.
- Add `.editorconfig` enforcing one-type-per-file via Roslyn analyzer `Meziantou.Analyzer` rule `MA0046` (or write a custom analyzer test for L2-045 in `Tab.Api.AcceptanceTests` that walks `*.cs` files and counts public top-level type decls).
- Wire CI workflow file (`.github/workflows/ci.yml`) running `build.ps1 build`, `build.ps1 test`, and `build.ps1 lint`.
- Add `build.ps1` with `build`, `test`, `lint`, `format`, `migrate` targets.

**Exit:** `build.ps1 build` succeeds; CI green on empty solution.

---

### Phase 1 — Persistence foundation (L2-025 / L2-043 / L2-047 / L2-048)

**Tasks**
- In `Tab.Domain`, add entities (one file each):
  - `User` (Id, Email, PasswordHash, CreatedUtc)
  - `Counterparty` (Id, UserId, Name, Note, CreatedUtc)
  - `Loan` (Id, UserId, CounterpartyId, Amount, Date, Description, Method, Note, CreatedUtc)
  - `RecurringBill` (Id, UserId, CounterpartyId, Name, Vendor, ExpectedAmount, DueDay, SplitPercent, ArchivedUtc?, CreatedUtc)
  - `BillPosting` (Id, UserId, CounterpartyId, RecurringBillId, Period (YYYY-MM), TotalAmount, ShareAmount, Date, CreatedUtc)
  - `PaymentIn` (Id, UserId, CounterpartyId, Amount, Date, Method, Note, CreatedUtc)
  - `Preferences` (UserId PK, CurrencyCode, DefaultSplitPercent, ReminderDays, StatementTone, UpdatedUtc)
  - `RefreshToken` (Id, UserId, TokenHash, IssuedUtc, ExpiresUtc, RevokedUtc?, ReplacedById?)
  - `StatementShare` (Id, UserId, FromDate, ToDate, TokenHash, ExpiresUtc, CreatedUtc)
- In `Tab.Application/Abstractions`, define `ITabDbContext` exposing each `DbSet<T>` as a property + `Task<int> SaveChangesAsync(CancellationToken)`.
- In `Tab.Infrastructure/Persistence`, implement `TabDbContext : DbContext, ITabDbContext` with entity configurations split one-per-file under `Persistence/Configurations/`.
- Configure indexes per L2-048: `(UserId, Date DESC)` on `Loan`, `BillPosting`, `PaymentIn`.
- Enforce `Counterparty` 1:1 with `User` via unique index on `Counterparty.UserId`.
- Add initial migration `Initial`. Apply via `dotnet ef database update`.
- Register `ITabDbContext` as scoped in DI (L2-043 #2).

**Exit:** Schema applies cleanly to LocalDB; an integration test creates a User + Counterparty, persists, reloads, asserts equality. Schema is in source control as a `.cs` migration.

---

### Phase 2 — OAuth 2.0 + JWT issuance (L2-002 / L2-015)

**Tasks**
- Create `Tab.Infrastructure/Auth/`:
  - `IPasswordHasher` (interface) → `Argon2idPasswordHasher` (concrete). Argon2id parameters: 64 MB memory, 4 iterations, 2 lanes (tunable per environment).
  - `IJwtIssuer` → `RsaJwtIssuer`. Signs with RS256. Loads private key from secrets (`dotnet user-secrets` in dev). Public key exposed at `GET /.well-known/jwks.json`.
  - `ITokenService` → `TokenService`. Mints access + refresh, persists `RefreshToken` with hashed value, rotates on refresh.
- Create MediatR requests under `Tab.Application/Auth/`:
  - `IssueTokenCommand` (password grant) → `IssueTokenCommandHandler` → returns `TokenResponse` (in `Tab.Api.Contracts`).
  - `RefreshTokenCommand` → `RefreshTokenCommandHandler`. Implements rotation: previous refresh marked `RevokedUtc + ReplacedById`.
  - `RevokeTokenCommand` → `RevokeTokenCommandHandler` (sign-out).
- Add `OAuthController` exposing `POST /api/v1/oauth/token` (grant_type=password|refresh_token) and `POST /api/v1/oauth/revoke`.
- Configure `JwtBearer` in `Tab.Api/Program.cs` with audience, issuer, RSA validation, clock skew 30s.
- Document key generation: `openssl genrsa -out tab.key 2048` + `openssl rsa -in tab.key -pubout -out tab.pub`. Store via user-secrets locally, Key Vault in higher envs.

**Tests**
- Unit: `Argon2idPasswordHasher` verifies a known good hash, rejects a known bad one, produces distinct hashes for same password (salted).
- Acceptance: `IssueToken_WithValidCredentials_ReturnsRs256JwtAndRefresh` traces to L2-002 #1, #2; `RefreshFlow_RotatesAndInvalidatesPrevious` traces to L2-002 #4; `ExpiredToken_ReturnsWwwAuthenticateChallenge` traces to L2-002 #3.

**Exit:** A test can authenticate with a seeded user, receive a valid JWT, call a placeholder `GET /api/v1/me`, and refresh successfully.

---

### Phase 3 — API plumbing (L2-024 / L2-034 / L2-046)

**Tasks**
- Add `ApiVersioning` via URL prefix (`/api/v1`) — explicit route, not middleware-based, to keep things simple.
- Implement `CorrelationIdMiddleware`:
  - Accept `X-Correlation-Id` header if present, else mint a UUIDv4.
  - Store in `IHttpContextAccessor` and Serilog `LogContext`.
  - Set on response.
- Configure Serilog with structured JSON output, fields: `Timestamp`, `Level`, `MessageTemplate`, `CorrelationId`, `RequestPath`, `UserId` (from `sub` when authenticated), `Exception`.
- Implement `ProblemDetailsFactory` (or use built-in) to produce RFC 7807 responses for: validation failures, 401, 403, 404, 500.
- Implement a `GlobalExceptionFilter` that converts unhandled exceptions → 500 ProblemDetails with `traceId` (correlation id), no stack trace in body.
- Configure security headers via middleware:
  - HSTS (`max-age=31536000; includeSubDomains; preload`)
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Content-Security-Policy`: `default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self' data:; frame-ancestors 'none'; base-uri 'self'`
- Force HTTPS (`app.UseHttpsRedirection()`) in non-Development.
- Add the MediatR pipeline behaviors (one per file, registered with open generics):
  - `LoggingBehavior<TRequest, TResponse>`
  - `ValidationBehavior<TRequest, TResponse>` (runs FluentValidation; throws `ValidationException` on failure)
  - `UnitOfWorkBehavior<TRequest, TResponse>` (for command handlers, calls `SaveChangesAsync` once at the end)
- Add a `RequireUser` attribute / filter that resolves `sub` claim into a `CurrentUser` scoped service injected by handlers.

**Tests**
- Acceptance: every response carries `X-Correlation-Id`; same id appears in logs (L2-034 #1, #2). Unhandled exception returns `application/problem+json` with no stack trace (L2-034 #3, L2-046 #1).

**Exit:** Hitting a deliberately broken endpoint returns Problem Details; correlation flows through logs; security headers visible on every response.

---

### Phase 4 — Counterparty + Preferences (L2-006 / L2-021)

**Tasks**
- On user sign-up, create a default `Counterparty` with `Name = "Counterparty"` and default `Preferences`.
- Commands/queries (one file each):
  - `GetCounterpartyQuery` / `Handler` → `CounterpartyResponse`
  - `UpdateCounterpartyCommand` / `Handler` / `Validator` (name required, ≤ 80 chars)
  - `GetPreferencesQuery` / `Handler` → `PreferencesResponse`
  - `UpdatePreferencesCommand` / `Handler` / `Validator` (currency ISO 4217; split 1–99; reminder days 1–14; tone enum)
- `CounterpartyController` (`GET/PUT /api/v1/counterparty`) and `PreferencesController` (`GET/PUT /api/v1/preferences`).

**Tests**
- Acceptance: rename counterparty, fetch, assert; reject empty name (L2-006 #3). Update preferences, fetch, assert.

**Exit:** Settings page in the UI could be wired against real endpoints.

---

### Phase 5 — Loans (L2-007 / L2-009 / L2-010)

**Tasks**
- `CreateLoanCommand` / `Handler` / `Validator` (amount > 0; description required ≤ 280; date ≤ today; method ≤ 40; note ≤ 280).
- `UpdateLoanCommand`, `DeleteLoanCommand`, `GetLoanByIdQuery`.
- `ListLedgerQuery` (yes, on the loans resource — L2-049 lists this endpoint with `type=loan|bill|payment` filter and `month=YYYY-MM`). Returns a typed paginated `LedgerEntryResponse[]` discriminated by `type`.
- `LoansController` with `GET /api/v1/loans`, `POST`, `GET /{id}`, `PUT /{id}`, `DELETE /{id}`.
- Add per-user isolation: every handler reads `CurrentUser.Id` and constrains the query. Cross-user reads return 404 (L2-005).

**Tests**
- Acceptance: create loan, list, edit, delete (full CRUD). Cross-user fetch returns 404 (L2-005 #1).
- Validation: negative amount → 400 with `amount` field (L2-023 #1).

**Exit:** Loans CRUD passes end-to-end.

---

### Phase 6 — Recurring bills + postings (L2-011 / L2-012 / L2-013 / L2-014 / L2-015)

**Tasks**
- `CreateRecurringBillCommand` / `Handler` / `Validator` (name required; expected > 0; due day 1–28; split 1–99 inclusive).
- `UpdateRecurringBillCommand` (edits affect only future postings — historical `BillPosting` rows are immutable; per L2-014 do not cascade changes).
- `ArchiveRecurringBillCommand` (sets `ArchivedUtc`; postings remain).
- `ListBillsQuery` returns active bills with computed `NextDueDate` and `SharePreview`.
- `CreateBillPostingCommand`:
  - Inputs: `BillId`, `Period (YYYY-MM)`, `Date (optional, default today)`, `ActualTotal (optional, defaults to ExpectedAmount)`.
  - Computes `ShareAmount = ActualTotal × (SplitPercent / 100)`, rounded half-up to 2 decimals.
  - Rejects duplicate `(BillId, Period)` with a 409 Conflict Problem Details.
- `BillsController`: `GET /api/v1/bills`, `POST`, `PUT /{id}`, `DELETE /{id}` (archive), `POST /{id}/postings`.

**Domain rules to encode**
- `BillPosting` is immutable once created (L2-014 #1). No `UpdateBillPostingCommand` in MVP.
- `(BillId, Period)` is unique → add an EF index with `IsUnique()`.

**Tests**
- Acceptance: create Hydro (168, 50%) → mark paid → assert posting amount $84 and balance increased (L2-013 #1). Second mark for same period → 409 (L2-013 #2). Log this month with actual $156.84 → $78.42 share (L2-013 #3). Edit split after a posting → only future postings reflect new split (L2-014 #1).

**Exit:** Bills + auto-split posting verified.

---

### Phase 7 — Payments in (L2-016)

**Tasks**
- `CreatePaymentCommand` / `Handler` / `Validator` (amount > 0).
- `PaymentsController` with `POST /api/v1/payments`.
- No update/delete in MVP (payments can be reversed by recording a new compensating loan if needed).

**Tests**
- Acceptance: record $100 → balance decreases by $100. Record amount > current balance → balance goes negative without error (L2-016 #2).

**Exit:** Payments in working.

---

### Phase 8 — Balance + Dashboard composite (L2-017 / L2-018)

**Tasks**
- `GetBalanceQuery` / `Handler` → `BalanceResponse { Amount, AsOf }`. Single SQL round-trip via three `SUM` projections, ideally combined into one query.
- `GetDashboardQuery` / `Handler` → `DashboardResponse { Balance, RecentActivity[6], MonthlySummary, UpcomingBill? }`. L2-026 #2: must be ≤ 1 round-trip per logical query (balance, recent, summary, upcoming) — verify in integration test via `Microsoft.EntityFrameworkCore.Diagnostics` command interceptor.
- `BalanceController` (`GET /api/v1/balance`), `DashboardController` (`GET /api/v1/dashboard`).

**Tests**
- Acceptance: with loans $505, bills-split $879.50, payments $100 → balance = $1284.50 exactly (L2-017 #1).
- Performance smoke: with 10 000 seeded entries, `/dashboard` returns in ≤ 300 ms p95 over 100 sequential calls on CI hardware (L2-026 #1).

**Exit:** Dashboard endpoint serves real data within budget.

---

### Phase 9 — Statement + share link (L2-019 / L2-020)

**Tasks**
- `GetStatementQuery` (`from`, `to` ISO dates; default `to = today`, `from = first day of earliest entry's month`). Returns chronological entries + running totals + final balance.
- `CreateStatementShareCommand`:
  - Mints a random 256-bit token, stores `SHA-256(token)` (not the token) in `StatementShare`, returns the URL `/share/{token}` with the token only in the response (one-time visibility).
  - `ExpiresUtc = now + 14 days` (L2-020 #1).
- `GetSharedStatementQuery` (anonymous, by token): hashes input, looks up by `TokenHash`, returns 404 with body "This statement is no longer available" if missing or expired (L2-020 #2).
- `StatementController`: `GET /api/v1/statement`, `POST /api/v1/statement/share`.
- `SharedStatementController`: `GET /api/v1/shared/{token}` — does not require auth, does not pass the controller through the global `[Authorize]` policy.

**Tests**
- Acceptance: generate share, fetch via token → 200 with read-only payload. After expiry (use injected `TimeProvider` to advance) → 404 with the public-facing message (L2-020 #2). Confirm shared payload contains no PII beyond statement fields (L2-020 #3).

**Exit:** Statement and share-link flow complete.

---

### Phase 10 — CSV export (L2-022)

**Tasks**
- `ExportLedgerCsvQuery` / `Handler` streams CSV using `System.IO.Pipelines` or a small `CsvWriter` (no external lib). Columns per L2-022: `date, type, description, total_amount, counterparty_share, method, note`. RFC 4180 quoting.
- `ExportController` with `GET /api/v1/export.csv` returns `text/csv; charset=utf-8` with `Content-Disposition: attachment; filename="tab-statement-{yyyy-MM-dd}.csv"`.

**Tests**
- Acceptance: export with comma-containing description → field is quoted. Header row present. Row count matches ledger entry count.

**Exit:** CSV export works and round-trips through Excel/Numbers cleanly.

---

### Phase 11 — Rate limiting & defense in depth (L2-025 / L2-024)

**Tasks**
- Use `Microsoft.AspNetCore.RateLimiting` (built-in since .NET 7) with:
  - Fixed-window limiter on `/api/v1/oauth/token` keyed by `email` (if present in body) → 5 attempts per 5 minutes per account (L2-025 #1).
  - Fixed-window limiter on `/api/v1/oauth/token` keyed by `RemoteIpAddress` → 10 attempts per 5 minutes per IP (L2-025 #2).
  - 429 response with `Retry-After` header.
- Add anti-enumeration: same response body and timing whether the email exists or not.
- Verify CSP / HSTS / Referrer-Policy / nosniff are in place (L2-024 #2) — add a header-assertion test in `Tab.Api.AcceptanceTests`.
- Ensure no cookie-based auth on JSON API (L2-024 #3): an integration test sends a refresh cookie without `Authorization` to a protected endpoint and expects 401.

**Exit:** Auth endpoints throttled; all security headers verified by automated test.

---

### Phase 12 — Hardening, observability polish, performance verification (L2-026 / L2-027 / L2-034)

**Tasks**
- Add a Serilog enricher that adds `UserId` from `HttpContext.User` claims when authenticated.
- Verify EF query plans for the dashboard and loans-list endpoints. Add `.AsNoTracking()` to all read paths. Confirm the `(UserId, Date DESC)` index is used (capture `SET STATISTICS IO` once during integration tests on LocalDB).
- Add a `k6` or `NBomber` script under `tests/perf/` that seeds 10 000 entries for a synthetic user and asserts p95 ≤ 300 ms for the dashboard and loans-list endpoints (L2-026 #1). Run on-demand, not on every CI run.
- Add an OpenAPI document via Swashbuckle annotated for every endpoint listed in L2-049. Verify in CI that every endpoint listed in L2-049 is documented and reachable.

**Exit:** All L2s for backend are covered by passing acceptance tests; performance budget verified once on representative hardware.

---

## 4. Cross-cutting test strategy

- **Acceptance tests are the source of truth** for "done" (per L2-051). They live in `Tab.Api.AcceptanceTests`, use `WebApplicationFactory<Program>`, run against an isolated test database per test class (`Respawn` to reset).
- **Every acceptance test file** opens with:
  ```csharp
  // Acceptance Test
  // Traces to: L2-013, L2-017
  // Description: Marking Hydro paid in full posts half to the balance.
  ```
- **Unit tests** focus on validators, computations (`ShareAmount` rounding), and pure handlers that can be wired to a fake `ITabDbContext` (use an in-memory implementation in the test project; do not use EF InMemory provider for anything that asserts ordering, decimals, or unique constraints).
- **Migration tests** apply every migration in order on a fresh LocalDB instance, then verify entity creation/read.
- **Determinism**: inject `TimeProvider` everywhere time is read; tests use `FakeTimeProvider` from `Microsoft.Extensions.TimeProvider.Testing`.

---

## 5. Local dev setup (document in repo README later)

```powershell
# 1. Install .NET SDK 8.0+, SQL Server LocalDB (ships with VS), Node 20+ (for FE later).
# 2. Restore + build:
./build.ps1 build
# 3. Set local secrets:
dotnet user-secrets --project src/Tab.Api set Jwt:RsaPrivateKeyPem "$(Get-Content tab.key -Raw)"
dotnet user-secrets --project src/Tab.Api set Jwt:RsaPublicKeyPem  "$(Get-Content tab.pub -Raw)"
# 4. Apply migrations:
dotnet ef database update --project src/Tab.Infrastructure --startup-project src/Tab.Api
# 5. Run API:
dotnet run --project src/Tab.Api
# 6. Tests:
./build.ps1 test
```

Connection string default (LocalDB): `Server=(localdb)\MSSQLLocalDB;Database=Tab;Trusted_Connection=True;Encrypt=False`.

---

## 6. Risks & open questions

| Risk | Mitigation |
|---|---|
| Argon2id parameters too aggressive for low-end dev machines (sign-in feels slow). | Make memory/iterations configurable via `appsettings.{Environment}.json`; tune dev down to 32 MB / 2 iterations. |
| MediatR free version (v12) license — confirm it remains free for current usage. | Pin to a known-free version range in `Directory.Packages.props`; reassess if MediatR licensing changes. |
| `Microsoft.EntityFrameworkCore.InMemory` silently passes tests that real SQL would fail (unique constraints, decimals, sorting). | Use Sqlite-in-memory for handler tests that care about constraints; use LocalDB for migration/integration tests. |
| Sharing a statement by URL is read-only but technically public if the URL leaks. | Already addressed by 14-day expiry + 256-bit token + `TokenHash` storage; document this in the share-action's UI copy as well. |
| Time-zone handling on `Date` (loan/bill dates are dates, not timestamps). | Store as `date` SQL type (not `datetime2`), treat as user-local civil date, do all "today" comparisons against `TimeProvider`'s local zone (config'd per user — out of MVP scope; UTC midnight is acceptable for MVP). |

---

## 7. Acceptance — backend is "done"

Backend is considered done when every L2 in §2 (Auth & session) through §10 (Tooling — backend-relevant portions: L2-046, L2-049, L2-050, L2-051) has at least one passing acceptance test whose header declares the trace, and a single command `./build.ps1 test` runs them all green.
