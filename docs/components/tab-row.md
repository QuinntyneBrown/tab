# tab-row

**Selector:** `tab-row`
**File:** `projects/components/src/lib/row/row.component.ts`
**Mock reference:** `docs/mocks/assets/js/components.js:321-370`
**Used in:** dashboard activity, loans month sections, settings preferences/data lists

## Purpose

A three-column list row: leading content (typically `<tab-avatar>` or icon),
body (`title` + optional `meta`), and trailing content (typically
`<tab-amount>`). Has an `interactive` mode (hover highlight, pointer cursor)
and a `last` modifier that removes the bottom divider so the final row in a
card group is clean.

## Visual reference

```
[●avatar]  Cash — groceries                                $120.00
           May 18 · loan
─────────────────────────────────────── hairline divider
```

## API

### Inputs
| Name | Type | Default | Description |
|---|---|---|---|
| `interactive` | `boolean` | `false` | Hover highlight + pointer cursor; horizontal padding bleeds out 10 px |
| `last` | `boolean` | `false` | Removes bottom border (use on final row in a card) |

### Outputs
| Name | Type | Description |
|---|---|---|
| `(click)` | `EventEmitter<MouseEvent>` | Emitted only when `interactive` |

### Content projection (named slots)
- `leading` — left graphic (avatar / icon)
- `title` — primary label (white-strong, 15 px, 500 weight, single-line ellipsis)
- `meta` — secondary line (muted, 13 px)
- `trailing` — right content (`<tab-amount>` or text)

## Visual specs

`.row`:
- `display: grid; grid-template-columns: auto 1fr auto`
- `align-items: center`
- `gap: 14px`
- `padding: 14px 4px`
- `border-bottom: 1px solid var(--c-hairline)`
- `transition: background var(--ease) 120ms`

`[interactive]`:
- `cursor: pointer`
- `padding: 14px`
- `margin: 0 -10px` (bleed)
- `border-radius: 10px`
- still `border-bottom: 1px solid var(--c-hairline)`

`[interactive]:hover`: `background: var(--c-elevated)`.
`[last]`: `border-bottom: none`.

Slotted content selectors:
- `[slot=title]`: `display: block; color: var(--c-text-strong); font-weight: 500; font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis`
- `[slot=meta]`:  `display: block; color: var(--c-muted); font-size: 13px; margin-top: 2px`
- `[slot=leading]`: `display: inline-flex; align-items: center`
- `[slot=trailing]`: `justify-self: end`

Host `display: block`.

## Angular template

```ts
@Component({
  selector: 'tab-row',
  standalone: true,
  template: `
    <div class="row" (click)="onClick($event)">
      <ng-content select="[slot=leading]"></ng-content>
      <div class="body">
        <ng-content select="[slot=title]"></ng-content>
        <ng-content select="[slot=meta]"></ng-content>
      </div>
      <ng-content select="[slot=trailing]"></ng-content>
    </div>
  `,
  styleUrls: ['./row.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    '[attr.interactive]': 'interactive ? "" : null',
    '[attr.last]':        'last ? "" : null',
    '[attr.role]':        'interactive ? "button" : null',
    '[attr.tabindex]':    'interactive ? 0 : null',
  },
})
export class TabRowComponent {
  @Input({ transform: booleanAttribute }) interactive = false;
  @Input({ transform: booleanAttribute }) last = false;
  @Output() click = new EventEmitter<MouseEvent>();

  onClick(e: MouseEvent) { if (this.interactive) this.click.emit(e); }

  @HostListener('keydown', ['$event'])
  onKey(e: KeyboardEvent) {
    if (!this.interactive) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      (e.target as HTMLElement).click();
    }
  }
}
```

## SCSS

```scss
@use '../tokens' as tokens;

:host { @include tokens.tab-tokens; display: block; }

.row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 14px;
  padding: 14px 4px;
  border-bottom: 1px solid var(--c-hairline);
  transition: background var(--ease) 120ms;
}

:host([interactive]) .row {
  cursor: pointer;
  padding: 14px;
  margin: 0 -10px;
  border-radius: 10px;
  border-bottom: 1px solid var(--c-hairline);
}
:host([interactive]) .row:hover { background: var(--c-elevated); }
:host([last]) .row { border-bottom: none; }

::slotted([slot='leading']) { display: inline-flex; align-items: center; }
.body { min-width: 0; }
::slotted([slot='title']) {
  display: block;
  color: var(--c-text-strong);
  font-weight: 500;
  font-size: 15px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
::slotted([slot='meta']) {
  display: block;
  color: var(--c-muted);
  font-size: 13px;
  margin-top: 2px;
}
::slotted([slot='trailing']) { justify-self: end; }
```

## Accessibility

- When `interactive`, host becomes `role="button"` + `tabindex="0"` and
  responds to Enter/Space.
- For navigation rows (settings prefs), prefer wrapping with `routerLink` or
  treating the row as a router target.

## Acceptance criteria

- [ ] Three-column grid (`auto 1fr auto`) with 14 px gap.
- [ ] Title and meta render with correct color and weight.
- [ ] `interactive` hover fills `--c-elevated` and applies 10 px bleed.
- [ ] `last` removes the bottom divider on the last row of any group.
- [ ] Title overflows with ellipsis on narrow widths.
