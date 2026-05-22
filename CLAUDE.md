# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Principles

- Speed is not a goal. Functional and complete is the goal.

## Layout

```
backend/        .NET 8 backend solution (Tab.sln)
  src/
    Tab.Api/                ASP.NET Core host (composition root)
    Tab.Api.Contracts/      DTOs shared with the frontend
    Tab.Application/        MediatR requests/handlers/validators + abstractions
    Tab.Domain/             Pure entities
    Tab.Infrastructure/     EF Core, JWT, password hasher, time provider
  tests/
    Tab.Api.AcceptanceTests/
    Tab.Application.UnitTests/
    Tab.Infrastructure.IntegrationTests/
docs/           specs, design, plans
frontend/       Angular workspace (separate)
```

## Backend commands

Run from `backend/`:

```powershell
./build.ps1 build      # dotnet build Tab.sln
./build.ps1 test       # dotnet test Tab.sln
./build.ps1 lint       # dotnet format --verify-no-changes --severity warn
./build.ps1 lint:fe    # public-surface + tab-app-structure checks
./build.ps1 traces     # verify every test file traces to a known L2-NNN (L2-051)
./build.ps1 invariants # architectural invariants: no HttpClient in components,
                       #   no concrete DbContext in handlers, no IRepository,
                       #   one public C# type per file (L2-040/043/044/045)
./build.ps1 format     # dotnet format
./build.ps1 migrate    # dotnet ef database update against LocalDB
./build.ps1 e2e        # migrate + seed users + boot API + boot Angular + run playwright
./build.ps1 perf       # NBomber smoke against /dashboard + /loans (requires API+DB)
./build.ps1 ship       # build + test + traces + lint:fe + ng build {api,components,tab}
```

Run a single test:

```powershell
dotnet test backend/tests/Tab.Api.AcceptanceTests --filter "FullyQualifiedName~OAuthTokenTests"
```

## Backend conventions

- One public type per `.cs` file; filename matches the type. (L2-045)
- Controllers are thin: bind → `IMediator.Send` → return `ActionResult<T>`. (L2-042)
- Handlers depend on `ITabDbContext` (interface), never on `TabDbContext`. (L2-043)
- No repository pattern. LINQ queries go directly on `DbSet<T>`. (L2-044)
- Inject `TimeProvider` for any time read. Do not use `DateTime.UtcNow` inline.
- Errors are `application/problem+json` with `traceId` echoed from `X-Correlation-Id`. (L2-046)
- Every acceptance test file begins with a `// Traces to: L2-NNN` header. (L2-051)

## High-level architecture

- `Tab.Domain` has no NuGet dependencies beyond the BCL.
- `Tab.Application` references `Tab.Domain` + `Tab.Api.Contracts`. Depends only on MediatR, FluentValidation, and EF Core abstractions.
- `Tab.Infrastructure` references `Tab.Application`. Provides `TabDbContext`, `Argon2idPasswordHasher`, `RsaJwtIssuer`, `TokenService`, and EF configurations.
- `Tab.Api` is the composition root. Wires JWT bearer with RSA keys (auto-generated in dev, loaded from `Jwt:RsaPrivateKeyPem` in higher envs), rate limiting on `/oauth/token` (per-IP + per-account fixed windows), correlation IDs, security headers, Serilog JSON logs, and Swagger.
- ASP.NET Core minimal hosting model — see `Program.cs` and the two extension files `TabServiceCollectionExtensions.cs` / `TabApplicationBuilderExtensions.cs`.
- Acceptance tests use `WebApplicationFactory<Program>` with a shared open SQLite in-memory connection per test fixture and a `FakeTimeProvider` from `Microsoft.Extensions.TimeProvider.Testing`. The fixture is scoped per class (or per test where the test mutates time).

## Frontend

The Angular workspace lives in `frontend/`. The backend doesn't depend on it. Build/test commands for the frontend will be documented separately when the workspace is wired in.

## Next steps

- Page-level pixel parity: capture mock baselines with `npx tsx e2e/visual/capture-baselines.ts`, then run `./backend/build.ps1 e2e -- visual.spec.ts --update-snapshots` once locally and tighten any page CSS that diverges from `docs/mocks/`.
