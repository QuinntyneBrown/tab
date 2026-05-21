# tab-button

**Selector:** `tab-button`
**File:** `projects/components/src/lib/button/button.component.ts`
**Mock reference:** `docs/mocks/assets/js/components.js:23-86`
**Used in:** login, dashboard, loans, bills, add, statement, settings

## Purpose

The single button primitive. Three variants (`primary` / `ghost` / `quiet`), two
sizes (default / `sm`), with optional `full` (block) and `disabled` states.
Default appearance is white-on-black: strong text strong contrast, used for the
primary affordance on every screen.

## Visual reference

```
primary (default)              ghost                          quiet
┌─────────────────────┐        ┌─────────────────────┐        — Edit —
│   Sign in           │        │   Use a magic link  │
└─────────────────────┘        └─────────────────────┘
bg #E6E6EA / text #2E2E30      transparent / 1px hairline      transparent text only
14×22 px / radius 12 / 48 min  same metrics, hover #3A3A3D     10×14 px / no min-h
```

Size `sm`: padding `8×14`, font 13, radius 8, no min-height.

## API

### Inputs
| Name | Type | Default | Description |
|---|---|---|---|
| `variant` | `'primary' \| 'ghost' \| 'quiet'` | `'primary'` | Style variant |
| `size` | `'md' \| 'sm'` | `'md'` | Compact (`sm`) for filter rows and inline actions |
| `full` | `boolean` | `false` | Stretch to fill the parent (sets `display: block` on host) |
| `disabled` | `boolean` | `false` | Disable button; reduces opacity to 0.4, cursor not-allowed |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Native button type |

### Outputs
| Name | Type | Description |
|---|---|---|
| `(click)` | `EventEmitter<MouseEvent>` | Bubbles native click (emit only when not disabled) |

### Content projection
- Default slot: button label (text or icon + text)

## Visual specs (lifted verbatim from `components.js`)

| Property | primary | ghost | quiet | size=sm |
|---|---|---|---|---|
| `background` | `var(--c-text-strong)` (#E6E6EA) | `transparent` | `transparent` | inherits |
| `color` | `var(--c-bg)` (#2E2E30) | `var(--c-text-strong)` | `var(--c-text)` | inherits |
| `border` | `1px solid transparent` | `1px solid var(--c-hairline-strong)` | `1px solid transparent` | inherits |
| `padding` | `14px 22px` | `14px 22px` | `10px 14px` | `8px 14px` |
| `min-height` | `48px` | `48px` | `0` | `0` |
| `border-radius` | `12px` | `12px` | `12px` | `8px` |
| `font-size` | `15px` | `15px` | `15px` | `13px` |
| `font-weight` | `550` | `550` | `550` | inherits |
| `letter-spacing` | `-0.005em` | inherits | inherits | inherits |
| `font-family` | `var(--font-sans)` | inherits | inherits | inherits |
| `width` | `100%` (inside `inline-block` host) | inherits | inherits | inherits |

Host display: `inline-block` by default, `block` when `[full]` set.

### States
- `hover` (primary): `background: #F2F2F4`.
- `hover` (ghost): `background: var(--c-elevated)`.
- `hover` (quiet): `color: var(--c-text-strong); background: var(--c-elevated)`.
- `active`: `transform: scale(0.985)`.
- `focus-visible`: `outline: 2px solid var(--c-focus); outline-offset: 2px`.
- `disabled`: `opacity: 0.4; cursor: not-allowed`.
- Transitions: `transform var(--ease) 160ms, background var(--ease) 160ms, color var(--ease) 160ms, border-color var(--ease) 160ms`.

## Angular template

```ts
@Component({
  selector: 'tab-button',
  standalone: true,
  template: `
    <button
      part="button"
      [type]="type"
      [disabled]="disabled"
      (click)="emitClick($event)">
      <ng-content></ng-content>
    </button>
  `,
  styleUrls: ['./button.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    '[attr.variant]': 'variant === "primary" ? null : variant',
    '[attr.size]': 'size === "md" ? null : size',
    '[attr.full]': 'full ? "" : null',
    '[attr.disabled]': 'disabled ? "" : null',
  },
})
export class TabButtonComponent {
  @Input() variant: 'primary' | 'ghost' | 'quiet' = 'primary';
  @Input() size: 'md' | 'sm' = 'md';
  @Input({ transform: booleanAttribute }) full = false;
  @Input({ transform: booleanAttribute }) disabled = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Output() click = new EventEmitter<MouseEvent>();

  emitClick(e: MouseEvent) {
    if (this.disabled) { e.stopPropagation(); return; }
    this.click.emit(e);
  }
}
```

## SCSS

```scss
@use '../tokens' as tokens;

:host {
  @include tokens.tab-tokens;
  display: inline-block;
}
:host([full]) { display: block; }

button {
  font: inherit;
  font-family: var(--font-sans);
  font-weight: 550;
  letter-spacing: -0.005em;
  color: var(--c-bg);
  background: var(--c-text-strong);
  border: 1px solid transparent;
  padding: 14px 22px;
  border-radius: 12px;
  cursor: pointer;
  width: 100%;
  min-height: 48px;
  font-size: 15px;
  transition:
    transform var(--ease) 160ms,
    background var(--ease) 160ms,
    color var(--ease) 160ms,
    border-color var(--ease) 160ms;

  &:hover  { background: #F2F2F4; }
  &:active { transform: scale(0.985); }
  &:focus-visible {
    outline: 2px solid var(--c-focus);
    outline-offset: 2px;
  }
}

:host([variant='ghost']) button {
  background: transparent;
  color: var(--c-text-strong);
  border-color: var(--c-hairline-strong);
  &:hover { background: var(--c-elevated); }
}

:host([variant='quiet']) button {
  background: transparent;
  color: var(--c-text);
  border-color: transparent;
  padding: 10px 14px;
  min-height: 0;
  &:hover { color: var(--c-text-strong); background: var(--c-elevated); }
}

:host([size='sm']) button {
  padding: 8px 14px;
  min-height: 0;
  font-size: 13px;
  border-radius: 8px;
}

:host([disabled]) button { opacity: 0.4; cursor: not-allowed; }
```

## Accessibility

- Renders a native `<button>` — keyboard focusable by default.
- Use `type="submit"` for form submission (login, add). Default `type="button"`
  avoids accidental submits when nested in forms.
- `focus-visible` provides 2 px ring at 2 px offset.
- When acting as a navigation target (e.g. wrapping `<a>` in mocks), prefer a
  separate `<a>` styled identically — do not use buttons for routes. The mocks
  wrap an `<a>` inside `<tab-button>`; in Angular, switch to `routerLink` on a
  styled host via `<tab-button>` content being a router link is acceptable.

## Acceptance criteria

- [ ] All three variants match `components.js:31-73` pixel-for-pixel at 360 / 768 / 1280 px.
- [ ] `[full]` makes host `display: block`; non-full sits inline.
- [ ] `sm` size used in filter row on `loans.html` shrinks correctly.
- [ ] Active scale-down, hover lift, focus ring all match the mocks.
- [ ] Disabled blocks click event emission and shows opacity 0.4.
- [ ] No green/red ever introduced.
