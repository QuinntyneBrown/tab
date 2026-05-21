# tab-nav

**Selector:** `tab-nav`
**File:** `projects/components/src/lib/nav/nav.component.ts`
**Mock reference:** `docs/mocks/assets/js/components.js:462-578`
**Used in:** dashboard, loans, bills, settings (every page with the four tabs)

## Purpose

Primary navigation between the four top-level screens — Home, Loans, Bills,
Settings. Sticky bottom bar with icon-over-label tiles on mobile/tablet; flips
to a vertical left rail (with brand mark at top, icon-left labels) at
≥ 960 px.

## Visual reference

```
Mobile (bottom sticky, blurred):
┌────────────────────────────────────────┐
│  🏠       💳       🧾       ⚙          │
│  Home     Loans    Bills    Settings   │
└────────────────────────────────────────┘
background: rgba(46,46,48,0.86) + backdrop-blur

Desktop (left rail, 240 px):
┌──────────────┐
│ tab.         │ ← brand 22px num-font
│              │
│ 🏠 Home      │ ← active = bg --c-elevated
│ 💳 Loans     │
│ 🧾 Bills     │
│ ⚙  Settings  │
│              │
└──────────────┘
```

## API

### Inputs
| Name | Type | Default | Description |
|---|---|---|---|
| `active` | `'dashboard' \| 'loans' \| 'bills' \| 'settings'` | — | Key of the currently selected tab |

### Outputs
| Name | Type | Description |
|---|---|---|
| `(navigate)` | `EventEmitter<{ key: string; href: string }>` | Fires when a tab is clicked (use to invoke Router) |

## Internal config

```ts
const ITEMS = [
  { key: 'dashboard', label: 'Home',     href: '/dashboard',
    icon: 'M3 11l9-8 9 8;M5 10v10h14V10' },
  { key: 'loans',     label: 'Loans',    href: '/loans',
    icon: 'rect 3,6,18,13,2;M3 10h18' },
  { key: 'bills',     label: 'Bills',    href: '/bills',
    icon: 'M6 3h12v18l-3-2-3 2-3-2-3 2V3z;M9 8h6M9 12h6' },
  { key: 'settings',  label: 'Settings', href: '/settings',
    icon: 'circle 12,12,3;cog-ring-path' },
];
```

(Use the exact SVG paths from `components.js:558-566` — copy them character for character.)

## Visual specs

Mobile/tablet (default):
- Host `position: sticky; bottom: 0; display: block`
- `background: rgba(46, 46, 48, 0.86)`
- `backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px)`
- `border-top: 1px solid var(--c-hairline-strong)`
- `z-index: 10`

`nav`:
- `display: grid; grid-template-columns: repeat(4, 1fr)`
- `padding: 8px 8px max(8px, env(safe-area-inset-bottom))`
- `gap: 2px`

`a` (each tab):
- `display: flex; flex-direction: column; align-items: center; gap: 4px`
- `padding: 10px 6px`
- `color: var(--c-muted)`
- `text-decoration: none`
- `font-size: 11px; font-weight: 500`
- `border-radius: 12px`
- `transition: color/background var(--ease) 160ms`
- hover: `color: var(--c-text)`
- `.active`: `color: var(--c-text-strong)` (and the icon stroke inherits)

`svg` (icons):
- `22 × 22 px`
- `stroke: currentColor; fill: none`
- `stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round`
- `flex-shrink: 0`

Desktop (`@media (min-width: 960px)`):
- Host: `position: static; background: transparent; backdrop-filter: none;
  border-top: none; border-right: 1px solid var(--c-hairline-strong);
  height: 100%; display: flex; flex-direction: column`
- `.brand-rail`: visible, `display: flex; align-items: center; gap: 8px;
  padding: 28px 24px 24px; font-family: var(--font-num); font-weight: 700;
  font-size: 22px; letter-spacing: -0.04em; color: var(--c-text-strong)`
  - `.brand-rail .dot { color: var(--c-muted) }`
- `nav`: `grid-template-columns: 1fr; grid-auto-rows: max-content; padding: 8px 12px; gap: 2px; flex: 1`
- `a`: `flex-direction: row; justify-content: flex-start; gap: 14px; padding: 12px 14px;
  font-size: 14px; font-weight: 500; border-radius: 10px`
- `a.active`: `background: var(--c-elevated)`

## Angular template

```ts
@Component({
  selector: 'tab-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgFor],
  template: `
    <div class="brand-rail">tab<span class="dot">.</span></div>
    <nav>
      <a *ngFor="let item of items"
         [routerLink]="item.href"
         routerLinkActive="active"
         [class.active]="active === item.key"
         [attr.data-k]="item.key"
         (click)="navigate.emit(item)">
        <svg viewBox="0 0 24 24" [innerHTML]="iconSafe(item.iconPaths)"></svg>
        <span>{{ item.label }}</span>
      </a>
    </nav>
  `,
  styleUrls: ['./nav.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class TabNavComponent {
  @Input() active: 'dashboard' | 'loans' | 'bills' | 'settings' | null = null;
  @Output() navigate = new EventEmitter<NavItem>();
  items: NavItem[] = [/* see config above */];

  constructor(private sanitizer: DomSanitizer) {}
  iconSafe(paths: string) {
    return this.sanitizer.bypassSecurityTrustHtml(paths);
  }
}
```

> **SSR note:** the icon paths can be rendered server-side as static `innerHTML`;
> avoid `*ngFor` over individual `<path>` elements only because keeping the path
> data byte-identical to the mocks matters more than ergonomics.

## SCSS

```scss
@use '../tokens' as tokens;

:host {
  @include tokens.tab-tokens;
  position: sticky;
  bottom: 0;
  display: block;
  background: rgba(46, 46, 48, 0.86);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-top: 1px solid var(--c-hairline-strong);
  z-index: 10;
}

.brand-rail { display: none; }

nav {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  padding: 8px 8px max(8px, env(safe-area-inset-bottom));
  gap: 2px;
}

a {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 6px;
  color: var(--c-muted);
  text-decoration: none;
  font-size: 11px;
  font-weight: 500;
  border-radius: 12px;
  transition: color var(--ease) 160ms, background var(--ease) 160ms;
  min-width: 0;

  &:hover  { color: var(--c-text); }
  &.active { color: var(--c-text-strong); }
  &.active svg { stroke: var(--c-text-strong); }

  span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

svg {
  width: 22px; height: 22px;
  stroke: currentColor; fill: none;
  stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round;
  flex-shrink: 0;
}

@media (min-width: 960px) {
  :host {
    position: static;
    background: transparent;
    backdrop-filter: none;
    border-top: none;
    border-right: 1px solid var(--c-hairline-strong);
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  .brand-rail {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 28px 24px 24px;
    font-family: var(--font-num);
    font-weight: 700;
    font-size: 22px;
    letter-spacing: -0.04em;
    color: var(--c-text-strong);

    .dot { color: var(--c-muted); }
  }
  nav {
    grid-template-columns: 1fr;
    grid-auto-rows: max-content;
    padding: 8px 12px;
    gap: 2px;
    flex: 1;
  }
  a {
    flex-direction: row;
    justify-content: flex-start;
    gap: 14px;
    padding: 12px 14px;
    font-size: 14px;
    font-weight: 500;
    border-radius: 10px;

    &.active { background: var(--c-elevated); }
    span { font-size: 14px; }
  }
}
```

## Accessibility

- Each tab is an `<a>` with `aria-current="page"` when active (via `routerLinkActive`).
- Container should have `role="navigation"` + `aria-label="Primary"`.
- Icons are decorative (text label adjacent) — set `aria-hidden="true"` on `<svg>`.

## Acceptance criteria

- [ ] Mobile: 4-column grid, sticky bottom, 86 % opacity bg with 16 px blur, hairline-strong top border.
- [ ] Active mobile tab uses `--c-text-strong` color, no background fill.
- [ ] Desktop (≥ 960): vertical rail, brand mark at top, active tab has `--c-elevated` fill.
- [ ] All 4 icons match the exact SVG paths in `components.js:558-566`.
- [ ] `safe-area-inset-bottom` honored on iOS notch devices.
- [ ] No green / red ever used.
