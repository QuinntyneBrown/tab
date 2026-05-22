# Glossary

This glossary defines the terms used across the **tab** product, its requirements, and its codebase. Terms are grouped by area for quick scanning. Where a term has a specific meaning inside this app, the app-specific meaning takes precedence over any generic industry usage.

## Domain terms

### Tab
The personal ledger between the authenticated user and their single counterparty. The app itself is named after this concept.

### User
The authenticated owner of a tab. Each user owns a private ledger that no other user can see.

### Counterparty
The other person on the tab — the individual the user is lending to or sharing bills with. Each user has exactly one counterparty. Loans, bill splits, and payments-in are all scoped to that counterparty.

### Ledger
The chronological record of every entry that contributes to the outstanding balance, including loans, bill-split postings, and payments-in. The ledger is groupable by month and filterable by type.

### Entry
A single line item in the ledger. Every entry is one of: a loan, a bill-split posting, or a payment-in.

### Loan
A discrete amount the user lent to the counterparty. A loan increases the outstanding balance and captures amount, date, description, method, and an optional note.

### Recurring bill
A shared expense the user pays in full but for which the counterparty owes a share. Each bill has a name, vendor, cadence, expected amount, due day, and split percentage.

### Bill split
The portion of a recurring bill that the counterparty owes, calculated from the bill's split percentage.

### Bill-split posting
The ledger entry that is automatically created when the user marks a recurring bill as paid for a given period. The posting equals the counterparty's share and increases the outstanding balance.

### Payment-in
A payment received from the counterparty. Payments-in decrease the outstanding balance and are visually distinguished from loans in the ledger.

### Outstanding balance
The single authoritative figure representing what the counterparty owes the user. It is computed as the sum of all loans plus all bill-split postings minus all payments-in.

### Statement
A read-only, shareable view of the ledger for a selected period, presented in a neutral factual tone suitable for printing or PDF export.

### Activity
Any change to the ledger — a loan recorded, a bill marked paid, a payment-in recorded. The dashboard surfaces recent activity.

### Nudge
A proactive, in-app reminder for a bill due in the near future. Nudges do not use external notification infrastructure in the MVP.

### Split percentage
The fraction of a recurring bill that the counterparty owes. Configurable per bill, with a user-level default.

### Reminder lead time
The number of days before a bill's due date at which the app starts surfacing a nudge.

### Statement tone
A user preference controlling the wording style of the shareable statement.

## Requirements and traceability

### L1
The high-level requirements document (`docs/specs/L1.md`). Captures **what** the system must do.

### L2
The detailed acceptance criteria document (`docs/specs/L2.md`). Captures **how** the system must behave, screen by screen.

### L1-NNN / L2-NNN
Stable identifiers for individual requirements (for example, `L1-007`, `L2-014`). Acceptance tests reference these IDs to maintain traceability.

### Acceptance test
An automated end-to-end test under `e2e/tests` that validates one or more L2 requirements. Each acceptance-test file declares the L2 IDs it covers in a header comment.

## Architecture and code terms

### Workspace
The Angular monorepo under `frontend/` containing the application and its supporting libraries.

### `tab` application
The Angular application project (`frontend/projects/tab`). Owns routing, route guards, pages, and bootstrap. Composes UI from the components library and data access from the api library.

### `api` library
The Angular library (`frontend/projects/api`) that exposes the frontend's data-access surface as TypeScript interfaces and `InjectionToken<T>` exports. Concrete HTTP implementations live behind those tokens.

### `components` library
The Angular library (`frontend/projects/components`) containing every reusable presentation component. Components in this library are template-driven, BEM-styled, and have no knowledge of routing or HTTP.

### Interface-first API
The convention that consumers depend on TypeScript interfaces and injection tokens, never on concrete service classes. Implementations are provided via DI bindings.

### Injection token
An Angular `InjectionToken<T>` used to bind an interface to a concrete implementation in the DI container.

### Signal
An Angular reactive primitive. The frontend prefers signals over RxJS where both are viable.

### BEM
Block, Element, Modifier — the CSS naming convention used in the components library (for example, `.ledger`, `.ledger__row`, `.ledger__row--paid`).

### Standalone component
An Angular component declared with `standalone: true` and no NgModule. All components in this workspace are standalone.

### One type per file
The repository convention that every public TypeScript or C# type lives in its own file, named for the type it contains.

### Thin controller
An ASP.NET Core controller whose only responsibility is to translate an HTTP request into a MediatR request and return the result. No business logic lives in controllers.

### MediatR
The in-process request/response library used to dispatch commands and queries from controllers to handlers.

### Command
A MediatR request that mutates state (for example, `RecordLoanCommand`). Commands are validated with FluentValidation before reaching their handler.

### Query
A MediatR request that reads state without mutation (for example, `GetOutstandingBalanceQuery`).

### Handler
The class that executes a command or query against `ITabDbContext` and returns a response.

### `ITabDbContext`
The interface that exposes the EF Core `DbContext` to MediatR handlers. Handlers depend on the interface, not the concrete `TabDbContext` class, so they can be tested in isolation.

### EF Core / Entity Framework Core
The .NET ORM used directly inside MediatR handlers. There is no repository layer.

### Migration
An EF Core code-first migration that evolves the database schema. Migrations are checked in and applied via `dotnet ef`.

### LocalDB
SQL Server LocalDB — the default development database engine. The default connection string targets `(localdb)\MSSQLLocalDB` with database name `Tab`.

### JWT
JSON Web Token. The backend issues signed JWT access tokens to authenticated clients.

### RFC 7807 / Problem Details
The structured error format returned by the API for failed requests.

### CSV export
A user-triggered export of the complete ledger as comma-separated values, used for record-keeping outside the app.

## Testing terms

### xUnit
The .NET test framework used for backend unit and integration tests.

### FluentAssertions
The assertion library paired with xUnit for readable test expectations.

### SQLite test infrastructure
The in-memory SQLite provider used to back `ITabDbContext` in fast backend tests.

### Vitest
The unit-test runner used by the Angular workspace via the Angular CLI.

### Playwright
The end-to-end browser test framework configured under `e2e/`.

### E2E
End-to-end. Tests that exercise the running frontend (and, where applicable, a real backend) through Playwright.

## UI and responsiveness terms

### Viewport breakpoints
The standard set used across the responsive UI: **XS** (< 576 px), **S** (≥ 576 px), **M** (≥ 768 px), **L** (≥ 992 px), **XL** (≥ 1200 px).

### Mobile-first
The CSS authoring approach in which base styles target XS and larger breakpoints add overrides via min-width media queries.

### WCAG 2.1 AA
The accessibility conformance level the UI targets for color contrast, keyboard navigation, focus visibility, semantic structure, and screen-reader labeling.

### Mock
A static HTML/CSS/JS visual reference under `docs/mocks/` used to align UI implementation with the intended design.

### Design system
The collection of tokens, components, and patterns documented under `docs/components/` and realized in the components library.

## Process terms

### MVP
Minimum Viable Product — the first usable slice of the app. Scope and acceptance criteria for MVP are defined in `docs/specs/L2.md`.

### Pre-implementation
A documentation- or scaffolding-only state in which production code for a given area has not yet been written.
