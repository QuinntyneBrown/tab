# tab

`tab` is a personal ledger for tracking loans, shared recurring bills, payments received, and the outstanding balance between two people.

The project is a full-stack web application: a .NET 8 Web API, an Angular 21 workspace split into application / API / components libraries, an executable acceptance-test suite, and a small design system with static visual mocks.

## Status

Implementation is well past scaffolding. The backend exposes all of the controllers required by the L2 specification (auth, counterparty, preferences, loans, bills, payments, balance, dashboard, statement + share, export). The Angular workspace ships eight composed pages (dashboard, loans, edit-loan, bills, statement, shared-statement, settings, login) built on a presentation component library. A Playwright suite of fourteen specs runs against the real stack and visual-parity baselines are captured from `docs/mocks/*.html` at three viewports.

There is no published release yet. API shapes, route names, and package exports may still change.

## Features

- Authenticated private ledger per user (RS256 JWT bearer, Argon2id password hashing, refresh-token rotation)
- Single counterparty profile per user
- Loans, recurring bills (with auto-posting math), and payments-in
- Server-side outstanding-balance calculation
- Chronological activity ledger grouped by month
- Dashboard summary, statement view, public share link for a statement, CSV export
- User preferences (statement tone, currency, date format)
- SQL Server LocalDB persistence through EF Core migrations
- Angular 21 application shell with separate `@tab/api` and `@tab/components` libraries
- Playwright e2e harness covering every L2 acceptance criterion, including pixel-parity screenshot tests
- Architectural invariants enforced by build scripts (no `HttpClient` in components, no concrete `DbContext` in handlers, no repositories, one public type per file, every test file traces to an L2 ID)

## Tech Stack

- **Backend:** .NET 8, ASP.NET Core, MediatR, FluentValidation, Entity Framework Core, SQL Server / LocalDB (SQLite in tests), JWT bearer (RS256), Argon2id, Serilog
- **Frontend:** Angular 21 (signals-first, standalone components), TypeScript 5.9, SCSS with BEM and design tokens, Angular SSR build
- **Testing:** xUnit, FluentAssertions, `Microsoft.AspNetCore.Mvc.Testing`, `Microsoft.EntityFrameworkCore.Sqlite`, `Microsoft.Extensions.TimeProvider.Testing`, Vitest, Playwright, axe-core, NBomber

## Repository Layout

```text
backend/
  src/
    Tab.Api/                ASP.NET Core host (composition root)
    Tab.Api.Contracts/      DTOs shared with the frontend
    Tab.Application/        MediatR requests, handlers, validators
    Tab.Domain/             Pure entities
    Tab.Infrastructure/     EF Core, JWT issuer, password hasher, time provider
    Tab.Cli/                Migrate / seed / user-admin / import CLI
  tests/
    Tab.Api.AcceptanceTests/
    Tab.Application.UnitTests/
    Tab.Infrastructure.IntegrationTests/
    perf/                   NBomber smoke against /dashboard + /loans
  Scripts/                  Verify-Traces.ps1, Verify-Invariants.ps1
  build.ps1                 Single-entry build/test/lint/migrate/e2e/ship script
frontend/
  projects/
    tab/                    Angular application (pages, routes, guards, providers)
    api/                    Interface-first API library (the only place HTTP is called)
    components/             Presentation component library (no HTTP, no Router)
e2e/                        Playwright config, fixtures, page objects, specs, visual baselines
docs/
  specs/                    L1 high-level + L2 detailed requirements with acceptance criteria
  plans/                    Backend and end-to-end build plans, milestone calendar
  components/               Component library design notes
  mocks/                    Static HTML/CSS/JS mocks — the visual contract
  glossary.md
```

## Prerequisites

- .NET SDK 8.0 or newer
- SQL Server LocalDB or SQL Server Express
- Node.js 20 or newer
- npm 10 or newer
- EF Core CLI (only if you need to author migrations):

```powershell
dotnet tool install --global dotnet-ef
```

## Getting Started

```powershell
git clone <repo-url>
cd tab

cd backend
.\build.ps1 restore
.\build.ps1 build

cd ..\frontend
npm install

cd ..\e2e
npm install
npm run install:browsers
```

## Backend Development

Single entry point: `backend/build.ps1`. Targets:

```powershell
cd backend

.\build.ps1 build         # dotnet build Tab.sln
.\build.ps1 test          # dotnet test Tab.sln
.\build.ps1 lint          # dotnet format --verify-no-changes --severity warn
.\build.ps1 format        # dotnet format
.\build.ps1 migrate       # apply EF Core migrations to LocalDB
.\build.ps1 traces        # every test file must carry "Traces to: L2-NNN" (L2-051)
.\build.ps1 invariants    # architectural invariants (L2-040/043/044/045)
.\build.ps1 lint:fe       # public-API + tab-app-structure checks
.\build.ps1 perf          # NBomber smoke against /dashboard + /loans
.\build.ps1 e2e           # migrate + seed + API + Angular + Playwright + teardown
.\build.ps1 ship          # build + test + traces + lint:fe + ng build {api,components,tab}

dotnet run --project .\src\Tab.Api\Tab.Api.csproj
```

Run a single backend test:

```powershell
dotnet test backend/tests/Tab.Api.AcceptanceTests --filter "FullyQualifiedName~OAuthTokenTests"
```

The development connection string points at `(localdb)\MSSQLLocalDB` with database name `Tab`. Acceptance tests use an in-memory SQLite connection per fixture and inject `FakeTimeProvider`.

JWT signing keys are read from `Jwt:RsaPrivateKeyPem`. If none is configured, the API generates an ephemeral RSA key at startup for local development — configure a durable key before relying on persistent tokens across restarts.

## Frontend Development

The Angular workspace contains three projects with strict boundaries:

- `projects/tab` — application shell only: routing, guards, interceptors, providers, and pages composing `@tab/components` + `@tab/api`. No reusable UI lives here.
- `projects/api` — interfaces, `InjectionToken<T>`s, DTO models, `provide…()` factories, and concrete `HttpClient`-backed services. **The only place HTTP is called.**
- `projects/components` — presentation components. No HTTP, no Router, no api-lib services.

```powershell
cd frontend

npm start                       # ng serve   → http://localhost:4200
npm run build
npm test                        # vitest via ng test

npm run ng -- build api
npm run ng -- build components
npm run ng -- build tab
```

## End-to-End Tests

Playwright lives under `e2e/` and defaults to `http://localhost:4200`. The full-stack runner (migrate + seed users + start API + start Angular + run Playwright + tear everything down) is:

```powershell
cd backend
.\build.ps1 e2e
.\build.ps1 e2e -- --project=chromium-desktop --grep "L2-001"
```

For ad-hoc runs against a stack you're already hosting:

```powershell
cd e2e
$env:E2E_BASE_URL = "http://localhost:4200"
npm test
```

Visual-parity baselines live under `e2e/visual/baselines/` and are captured from `docs/mocks/*.html` at XS (375×812), M (768×1024), XL (1440×900):

```powershell
cd e2e
npx tsx visual/capture-baselines.ts
```

After intentional design changes, refresh baselines with `npm test -- visual.spec.ts --update-snapshots`. Tolerance is `maxDiffPixelRatio: 0.01`.

Every acceptance test file opens with `// Traces to: L2-NNN`. `./build.ps1 traces` enforces this across the repository.

## Performance Smoke

`backend/tests/perf/Tab.Perf.csproj` seeds 10,000 loans and runs an NBomber scenario against `/api/v1/dashboard` and `/api/v1/loans`, asserting p95 ≤ 300 ms. Boot the API and DB first, then:

```powershell
cd backend
.\build.ps1 perf
```

## Documentation

- [High-level requirements (L1)](docs/specs/L1.md)
- [Detailed acceptance criteria (L2)](docs/specs/L2.md)
- [Backend implementation plan](docs/plans/backend.md)
- [End-to-end build plan](docs/plans/build-plan.md)
- [Milestone calendar](docs/plans/calendar.md)
- [Component library design](docs/components/README.md)
- [Static UI mocks](docs/mocks/README.md)
- [Glossary](docs/glossary.md)

## Architecture Principles

Backend:

- Controllers are thin: bind → `IMediator.Send` → return `ActionResult<T>`. No data access, no business logic.
- Handlers depend on `ITabDbContext` (interface), never on `TabDbContext`. No repository pattern; LINQ runs directly on `DbSet<T>`.
- Every endpoint is under `/api/v1/...`. Errors are `application/problem+json` with the `X-Correlation-Id` echoed as `traceId`.
- Time is read through `TimeProvider`. Validators are FluentValidation, one per command, with failures converted to RFC 7807 by `ValidationBehavior`.
- One public type per `.cs` file; filename matches the type.

Frontend:

- The application project contains only routes, guards, providers, interceptors, and `*.page.ts/.html/.scss` files. Reusable UI lives in the components library.
- `@tab/api` is the sole HTTP boundary. Public exports are limited to the interface, injection token, DTO models, and `provide…()` factory — never the concrete service.
- Signals over RxJS for state. HTTP results are converted to signals at the api-library boundary.
- BEM-only CSS in components, sourcing tokens from `projects/components/src/lib/tokens.scss`. No hard-coded colors.
- One public TypeScript type per file. Templates and styles in separate files.

Tests:

- Acceptance tests trace to L2 requirement IDs via a header comment.
- Architectural invariants and traceability are checked by `./build.ps1 invariants` and `./build.ps1 traces` and should be part of any pre-merge check.

## Contributing

Before opening a pull request:

1. Read the relevant requirement in `docs/specs/L1.md` and `docs/specs/L2.md`.
2. Keep changes scoped to the requirement being implemented.
3. Add or update tests that trace to the matching L2 ID.
4. Run `./build.ps1 ship` from `backend/` for the equivalent of a local pre-merge check.
5. Update documentation when commands, architecture, routes, or behavior change.

## Security

Do not commit secrets, private keys, connection strings for shared environments, or generated tokens. Use local user secrets or environment variables for sensitive configuration.

A security-reporting policy is not yet published. Add a `SECURITY.md` before accepting external vulnerability reports.

## License

No open-source license file is currently included. Add a `LICENSE` file before distributing or accepting outside contributions.
