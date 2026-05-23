# tab — UI Mocks

Static HTML mockups for **tab**, a personal app for tracking money lent to (and shared bills owed by) a single counterparty.

## Design intent

- **Tone:** calm, factual, dignified. The statement screen may be shared with the borrower; the UI never editorializes or shames. Numbers speak.
- **Aesthetic:** dark monochrome. Adobe palette `313133 / 3A3A3D / 2E2E30 / B4B4BC / 77777C`. No green/red — debt and paid states are conveyed by weight, size, and opacity, not color signaling.
- **Target:** 7★ on the Airbnb experience scale — thoughtful copy, restrained motion, anticipating the next action.

## Responsive behavior

Mobile-first, fluid through tablet, expansive on desktop. One stylesheet, three behaviors:

| Breakpoint | Shell | Nav | Notable shifts |
|---|---|---|---|
| **≤ 639px** (phone) | Full-bleed flex column | Sticky bottom bar with safe-area inset | Single-column content, hero balance dominates |
| **640–959px** (tablet) | Wider gutters, larger type via fluid `clamp()` | Bottom bar | Bills grid becomes 2-col, statement stays single col, login/add center as a comfortable card |
| **≥ 960px** (desktop) | `display: grid` with 240px left rail (auto-applied via `:has(tab-nav)`) | Vertical sidebar with brand + icon-left labels | Dashboard goes two-column (activity / summary), loans becomes 2-col at 1080px+, bills 3-col at 1280px+, page titles left-align and grow |

No JavaScript drives the responsive layout — only CSS media queries, `clamp()` for fluid type/spacing, `:has()` for shell selection, and intrinsic grids that reflow.

## Component model

Every reused piece of UI is a real Web Component (custom element), defined once in `assets/js/components.js`:

| Element | Purpose |
|---|---|
| `<tab-button variant="primary\|ghost\|quiet">` | All buttons |
| `<tab-card>` | Surface container |
| `<tab-input label="" type="">` | Labeled text/number input |
| `<tab-amount value="" size="hero\|md\|sm">` | Money with tabular numerals |
| `<tab-avatar name="">` | Initials avatar |
| `<tab-badge>` | Status pill |
| `<tab-row>` | List row (left / right slots) |
| `<tab-nav active="">` | Bottom nav (mobile-first) |
| `<tab-header title="" back="">` | Top bar |
| `<tab-divider>` | Hairline |
| `<tab-empty>` | Empty state |

CSS lives in `assets/css/`: `tokens.css` (palette, type, spacing), `base.css` (reset, layout), `components.css` (component internals — shadow-DOM-friendly via CSS custom properties).

## Screens

| File | Purpose |
|---|---|
| `login.html` | Email + passcode sign-in |
| `dashboard.html` | Hero balance, recent activity, quick actions |
| `loans.html` | All loans, grouped by month |
| `bills.html` | Recurring shared bills, next-due dates |
| `add-loan.html` | Add a loan (task-specific dialog) |
| `add-bill.html` | Log a bill payment (task-specific dialog) |
| `add-payment.html` | Record a payment-in (task-specific dialog) |
| `statement.html` | Read-only shareable summary |
| `settings.html` | Counterparty name, currency, sign-out |

Open `login.html` in a browser to start.
