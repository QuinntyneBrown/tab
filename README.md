# tab

`tab` is a personal ledger for tracking loans, shared recurring bills, payments received, and the outstanding balance between two people.

The project is built as a full-stack web application with a .NET API, an Angular frontend, reusable Angular libraries, executable acceptance criteria, and design-system documentation.

## Status

This repository is in early MVP implementation. The backend persistence and authentication foundation are present, the Angular workspace and component library are scaffolded, and the requirements/design documentation is more complete than the product surface.

APIs, UI routes, and package names may change until the first stable release.

## Features

- Authenticated private ledger per user
- Single counterparty profile
- Loan, bill-split, and payment-in tracking
- Server-side outstanding balance calculation
- Chronological activity ledger grouped by month
- Dashboard, statement, CSV export, and settings flows defined in acceptance criteria
- SQL Server persistence through Entity Framework Core migrations
- Angular application shell with separate API and component libraries
- Playwright e2e test harness for requirement-level acceptance tests

## Tech Stack

- **Backend:** .NET 8, ASP.NET Core Web API, MediatR, FluentValidation, Entity Framework Core, SQL Server/LocalDB, JWT bearer authentication
- **Frontend:** Angular 21, TypeScript, SCSS, Angular standalone components
- **Testing:** xUnit, FluentAssertions, EF Core SQLite test infrastructure, Vitest through Angular CLI, Playwright
- **Tooling:** npm 10, Angular CLI, `dotnet format`, EF Core migrations

## Repository Layout

```text
backend/        .NET solution, API, application layer, domain model, infrastructure, tests
frontend/       Angular workspace with the tab app plus api and components libraries
e2e/            Playwright configuration, fixtures, and acceptance-test harness
docs/specs/     L1 and L2 product requirements and acceptance criteria
docs/components Angular component implementation specs
docs/mocks/     Static HTML/CSS/JS visual mocks used as UI references
```

## Prerequisites

- .NET SDK 8.0 or newer
- SQL Server LocalDB or SQL Server Express for local backend persistence
- Node.js 20 or newer
- npm 10 or newer
- EF Core CLI if you need migrations:

```powershell
dotnet tool install --global dotnet-ef
```

## Getting Started

Clone the repository and restore each workspace:

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

The backend entry point is `backend/Tab.sln`. The main API project is `backend/src/Tab.Api`.

```powershell
cd backend

.\build.ps1 build
.\build.ps1 test
.\build.ps1 lint
.\build.ps1 format
.\build.ps1 migrate

dotnet run --project .\src\Tab.Api\Tab.Api.csproj
```

The default development connection string points at `(localdb)\MSSQLLocalDB` with database name `Tab`.

JWT signing keys are read from configuration. If no private key is configured, the API generates an ephemeral RSA key at startup for local development. Configure durable keys before using persistent tokens across restarts.

## Frontend Development

The frontend workspace contains:

- `projects/tab`: Angular application
- `projects/api`: interface-first API library
- `projects/components`: reusable presentation component library

```powershell
cd frontend

npm start
npm run build
npm test

npm run ng -- build api
npm run ng -- build components
npm run ng -- build tab
```

The development server runs at `http://localhost:4200` by default.

## End-to-End Tests

Playwright is configured under `e2e/` and defaults to `http://localhost:4200`.

Start the frontend app first, then run:

```powershell
cd e2e

$env:E2E_BASE_URL = "http://localhost:4200"
npm test
```

Acceptance specs should live under `e2e/tests` and include their traced L2 requirement IDs in a header comment.

## Documentation

- [High-level requirements](docs/specs/L1.md)
- [Detailed acceptance criteria](docs/specs/L2.md)
- [Backend implementation plan](docs/plans/backend.md)
- [Component library design](docs/components/README.md)
- [Static UI mocks](docs/mocks/README.md)

## Architecture Principles

- Backend controllers stay thin and dispatch through MediatR.
- EF Core is used directly through `ITabDbContext`; there is no repository layer.
- Public C# and TypeScript types live one per file.
- Frontend state prefers Angular signals over RxJS where practical.
- Reusable UI belongs in the components library; the application composes pages and routes.
- Acceptance tests trace back to L2 requirement IDs.

## Contributing

Before opening a pull request:

1. Read the relevant requirement in `docs/specs/L1.md` and `docs/specs/L2.md`.
2. Keep changes scoped to the requirement being implemented.
3. Add or update tests that trace to the matching L2 ID.
4. Run the relevant build and test commands for the area you changed.
5. Update documentation when commands, architecture, routes, or behavior change.

## Security

Do not commit secrets, private keys, connection strings for shared environments, or generated tokens. Use local user secrets or environment variables for sensitive configuration.

Security reporting policy is not yet published. Add a `SECURITY.md` before accepting external vulnerability reports.

## License

No open-source license file is currently included. Add a `LICENSE` file before distributing or accepting outside contributions.
