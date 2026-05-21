# tab — Component Library Design

This folder contains Angular implementation designs for every reusable UI piece
in the `tab` mocks (`../mocks/*.html`). Each markdown file maps 1:1 to one Angular
component that will live in `frontend/projects/components/src/lib/<name>/`.

The contract is **100% visual parity with the mocks**. The web components in
`docs/mocks/assets/js/components.js` are the authoritative spec — every measurement,
color, radius, transition, and font weight in those files must be reproduced
exactly in the Angular components.

## Library conventions

- **Workspace prefix:** the `components` library is configured with `prefix: "lib"`
  in `angular.json`. **Override the selector** on each component to use `tab-*`
  (matching the mocks) so screens look identical when porting markup.
- **Standalone components.** Angular 21, no NgModules.
- **Encapsulation:** `ViewEncapsulation.ShadowDom` for primitive components — this
  mirrors the mocks' shadow-DOM behavior (style isolation, slot semantics).
  Composition components may use `Emulated` if they only consume primitives.
- **Tokens:** design tokens are exported from `tokens.scss` and re-declared on
  `:host` of every component so shadow-DOM children resolve them. The token
  values match `docs/mocks/assets/css/tokens.css` exactly.
- **Content projection** uses `<ng-content>` with named slots that mirror the
  web components (`leading`, `title`, `meta`, `trailing`, `action`, `glyph`).

## Component catalog

### Primitives (parity with `components.js`)

| File | Selector | Source of truth |
|---|---|---|
| [tab-button.md](tab-button.md) | `tab-button` | `components.js:23-86` |
| [tab-card.md](tab-card.md) | `tab-card` | `components.js:88-111` |
| [tab-input.md](tab-input.md) | `tab-input` | `components.js:113-195` |
| [tab-amount.md](tab-amount.md) | `tab-amount` | `components.js:197-258` |
| [tab-avatar.md](tab-avatar.md) | `tab-avatar` | `components.js:260-289` |
| [tab-badge.md](tab-badge.md) | `tab-badge` | `components.js:291-319` |
| [tab-row.md](tab-row.md) | `tab-row` | `components.js:321-370` |
| [tab-divider.md](tab-divider.md) | `tab-divider` | `components.js:372-382` |
| [tab-header.md](tab-header.md) | `tab-header` | `components.js:384-460` |
| [tab-nav.md](tab-nav.md) | `tab-nav` | `components.js:462-578` |
| [tab-empty.md](tab-empty.md) | `tab-empty` | `components.js:580-618` |

### Page-composition components (recurring patterns across screens)

| File | Selector | Used in |
|---|---|---|
| [tab-brand.md](tab-brand.md) | `tab-brand` | login, dashboard, statement, nav rail |
| [tab-eyebrow.md](tab-eyebrow.md) | `tab-eyebrow` | dashboard hero, loans stats, statement |
| [tab-section-head.md](tab-section-head.md) | `tab-section-head` | dashboard, settings, loans |
| [tab-stat-card.md](tab-stat-card.md) | `tab-stat-card` | loans summary strip |
| [tab-nudge.md](tab-nudge.md) | `tab-nudge` | dashboard heads-up message |
| [tab-segmented.md](tab-segmented.md) | `tab-segmented` | add (Loan / Bill / Payment-in) |
| [tab-amount-input.md](tab-amount-input.md) | `tab-amount-input` | add (hero entry stage) |
| [tab-bill-card.md](tab-bill-card.md) | `tab-bill-card` | bills grid |
| [tab-ledger.md](tab-ledger.md) | `tab-ledger` | statement |
| [tab-totals.md](tab-totals.md) | `tab-totals` | statement |
| [tab-month-section.md](tab-month-section.md) | `tab-month-section` | loans |
| [tab-icon.md](tab-icon.md) | `tab-icon` | nav, back arrow, glyphs |

### Cross-cutting

| File | Purpose |
|---|---|
| [tokens.md](tokens.md) | Design tokens — palette, type, spacing, radius, motion |
| [app-shell.md](app-shell.md) | `.app` shell layout, breakpoints, sidebar/nav switching |

## How to read each document

Every component doc has the same shape:

1. **Header** — selector, file path, mock reference, screens using it
2. **Purpose** — one-sentence rationale
3. **Visual reference** — ASCII / state matrix
4. **API** — `@Input` / `@Output` / content slots
5. **Visual specs** — exact px / colors / weights pulled from `components.js`
6. **Template** — Angular template skeleton
7. **SCSS** — full styles (porting the web-component CSS literally)
8. **States** — hover, focus, active, disabled, responsive
9. **Accessibility** — roles, ARIA, keyboard
10. **Acceptance criteria** — implementation checklist for parity

## Visual parity workflow

After implementing a component:

1. Render it inside `projects/tab` next to its mock counterpart.
2. Take a screenshot at 360 × 640 (mobile), 768 × 1024 (tablet), 1280 × 800 (desktop).
3. Diff against `docs/mocks/<screen>.html` opened at the same viewport.
4. The diff must be ≤ 1 px on every measurable boundary and identical on color
   sampling. Anything else is a bug, not a "small difference".
