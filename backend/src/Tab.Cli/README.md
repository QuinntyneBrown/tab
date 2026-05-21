# Tab.Cli

Administrator CLI for the `tab` ledger. Built on **System.CommandLine** + **Microsoft.Extensions.Hosting** + DI, sharing the same `Tab.Application` / `Tab.Infrastructure` stack as the API. Used for ops, seed data, bulk imports/exports, and admin-level operations that bypass the public OAuth surface.

## Conventions

- **One command per file.** Every leaf `Command` lives in its own `.cs` file under `Commands/<group>/`.
- **SOLID.** Each command depends on an `IServiceScopeFactory` and resolves a single-responsibility service interface (`IDatabaseMigrator`, `IUserAdministrator`, `IDataImporter<T>`, etc.) inside its handler. Concrete implementations live behind interfaces in `Services/<area>/`.
- **No business logic in commands.** A command parses its options, opens a scope, and delegates. All real work happens in services.
- **Shares the backend stack.** Calls `AddTabApplication()` + `AddTabInfrastructure(configuration)` exactly like `Tab.Api`. User creation routes through the `RegisterUserCommand` MediatR handler so password hashing, counterparty creation, and preferences seeding stay in lock-step with the API.

## Build & run

From the repo root:

```powershell
dotnet build backend/Tab.sln
dotnet run --project backend/src/Tab.Cli -- --help
```

Or, once published:

```powershell
dotnet publish backend/src/Tab.Cli -c Release -o bin/cli
./bin/cli/tab --help
```

## Commands

| Command | Purpose |
|---|---|
| `tab db migrate` | Apply pending EF Core migrations. |
| `tab db reset --force` | Drop & recreate the database. Destructive. |
| `tab db seed --user <email>` | Seed a representative ledger for an existing user. |
| `tab users create --email <e> --passcode <p>` | Create a new user (counterparty + preferences seeded automatically). |
| `tab users list` | List every user. |
| `tab users delete --email <e> --force` | Delete a user and all their ledger data. Destructive. |
| `tab users reset-passcode --email <e> --passcode <p>` | **Administrator backdoor** — replace a user's passcode without their current one. |
| `tab users seed` | Idempotently create the demo users (`admin@tab.local`, `quinn@tab.local`, `demo@tab.local`). |
| `tab import loans   --user <e> --file <csv>` | Import loans from CSV. |
| `tab import bills   --user <e> --file <csv>` | Import recurring-bill definitions from CSV. |
| `tab import payments --user <e> --file <csv>` | Import payment-in records from CSV. |
| `tab import all     --user <e> --file <json>` | Import a full snapshot produced by `export all`. |
| `tab export loans    --user <e> --file <csv>` | Export loans to CSV. |
| `tab export bills    --user <e> --file <csv>` | Export recurring bills to CSV. |
| `tab export payments --user <e> --file <csv>` | Export payments to CSV. |
| `tab export all      --user <e> --file <json>` | Export a full ledger snapshot to JSON. |

## CSV column contracts

| File | Columns |
|---|---|
| loans       | `date, amount, description, method, note` |
| bills       | `name, vendor, expected_amount, due_day, split_percent` |
| payments    | `date, amount, method, note` |

All columns are case-insensitive on read. Output uses lower-case headers. RFC 4180 quoting is applied automatically.

## Configuration

`appsettings.json` ships with the LocalDB connection string and dev-grade Argon2id parameters. Override via:

- `appsettings.{Environment}.json`
- `dotnet user-secrets` (use `--id tab-cli-dev-secrets`)
- Environment variables prefixed `TAB_` (e.g. `TAB_ConnectionStrings__Tab=...`)

For the JWT issuer to bootstrap without errors, set:

```powershell
dotnet user-secrets --project backend/src/Tab.Cli set Jwt:RsaPrivateKeyPem "$(Get-Content tab.key -Raw)"
dotnet user-secrets --project backend/src/Tab.Cli set Jwt:RsaPublicKeyPem  "$(Get-Content tab.pub -Raw)"
```

(The CLI does not issue tokens — it just lives in the same DI graph and that graph wants the keys present.)

## Adding a new command

1. Create `Commands/<group>/<MyNew>Command.cs` implementing `ICliCommand` (for top-level groups) or constructing a `Command` directly inside the parent group's `Build()` (for leaves).
2. If the command needs new work, define an interface under `Services/<area>/I<MyService>.cs` and an implementation alongside it.
3. Register the service in `Hosting/CliServiceCollectionExtensions.cs`.
4. Wire the new command into its parent group's `Build()`.

That's it — no Reflection, no auto-registration magic, no hidden DI tricks. Adding capability is local and explicit.
