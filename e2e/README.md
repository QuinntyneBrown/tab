# tab — end-to-end tests

Playwright e2e tests for the tab web app. Tests are organised by the L2 acceptance criteria in `docs/specs/L2.md` and use the Page Object Model.

## Layout

```
e2e/
  pages/        # Page Object Model classes (one per page)
  tests/        # Test specs (one file per L2 area)
  fixtures/     # Playwright fixtures (auth, seed data, viewport)
```

## Running

```powershell
npm install
npm run install:browsers
npm test
```

By default tests run against `http://localhost:4200`. Override with `E2E_BASE_URL`.

## Status

All tests are expected to **fail** until the Angular frontend is implemented. They encode the L2 acceptance criteria as executable expectations and will turn green as the UI is built out.

## Traceability

Every spec file declares its covered L2 requirement(s) in a header comment per L2-051. Grep for `Traces to:` to map tests back to requirements.
