# tab-bill-card

**Selector:** `tab-bill-card`
**File:** `projects/components/src/lib/bill-card/bill-card.component.ts`
**Mock reference:** `docs/mocks/bills.html:27-48, 64-159`
**Used in:** bills grid

## Purpose

Composition card for a single recurring bill. Top: name + meta + status badge.
Middle: a two-column key/value grid (Expected · Ray's half, or Last paid ·
Ray's half). Bottom: two action buttons stacked side-by-side (primary `Log /
Mark paid`, ghost `Edit`).

## Visual reference

```
┌──────────────────────────────────────────┐
│ Hydro                       ( · DUE 4D ) │
│ Monthly · Toronto Hydro                  │
│ ───────────────────────────────────────  │
│ EXPECTED         RAY'S HALF              │
│ $168.00          $84.00                  │
│                                          │
│ [ Mark paid in full ] [ Edit ]           │
└──────────────────────────────────────────┘
```

## API

### Inputs
| Name | Type | Default | Description |
|---|---|---|---|
| `name` | `string` | required | Bill name (e.g. "Hydro") |
| `meta` | `string` | required | Sub-line ("Monthly · Toronto Hydro") |
| `badge` | `{ text: string; variant?: 'default' \| 'quiet'; dot?: boolean }` | required | Status badge config |
| `primaryKey` | `string` | required | Left cell key (e.g. "Expected", "Last paid") |
| `primaryValue` | `number` | required | Left cell amount |
| `primaryMuted` | `boolean` | `false` | Mute the left amount (used for "Last paid") |
| `splitKey` | `string` | `"Ray's half"` | Right cell key |
| `splitValue` | `number` | required | Right cell amount |
| `primaryAction` | `string` | `'Log this month'` | Primary button label |
| `secondaryAction` | `string` | `'Edit'` | Ghost button label |

### Outputs
| Name | Type | Description |
|---|---|---|
| `(primaryClick)` | `EventEmitter<void>` | Primary button |
| `(secondaryClick)` | `EventEmitter<void>` | Ghost button |

## Visual specs

Container: `<tab-card class="bill-card">` with custom internal layout. Or
implement as a dedicated component that owns its surface.

`.bill-card`:
- `padding: var(--s-5)` (20 px) — already provided if wrapping `<tab-card>` (override its default padding via `padding="md"`)
- `display: flex; flex-direction: column; height: 100%`

`.bill-top`:
- `display: flex; align-items: flex-start; justify-content: space-between`
- `gap: var(--s-3)`
- `margin-bottom: var(--s-4)`

`.bill-name`:
- `font-size: clamp(16px, 0.4vw + 15px, 18px)`
- `font-weight: 600`
- `color: var(--c-text-strong)`

`.bill-meta`:
- `color: var(--c-muted); font-size: 13px; margin-top: 2px`

`.bill-grid`:
- `display: grid; grid-template-columns: 1fr 1fr; gap: var(--s-3)`
- `border-top: 1px solid var(--c-hairline)`
- `padding-top: var(--s-4)`

`.cell .k`:
- `color: var(--c-muted); font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em`

`.cell .v`: `margin-top: 4px`.

`.bill-actions`:
- `display: flex; gap: var(--s-2)`
- `margin-top: auto`  ← pins to bottom of card
- `padding-top: var(--s-4)`
- Each button: `<tab-button full size="sm">` (primary) / `<tab-button full variant="ghost" size="sm">` (secondary)

## Grid container — page level

```scss
.bills-grid {
  display: grid;
  gap: var(--s-4);
  grid-template-columns: 1fr;
}
@media (min-width: 720px)  { .bills-grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1280px) { .bills-grid { grid-template-columns: repeat(3, 1fr); } }
```

## Angular template

```ts
@Component({
  selector: 'tab-bill-card',
  standalone: true,
  imports: [TabCardComponent, TabBadgeComponent, TabButtonComponent, TabAmountComponent, NgIf],
  template: `
    <tab-card class="bill-card">
      <div class="bill-top">
        <div>
          <div class="bill-name">{{ name }}</div>
          <div class="bill-meta">{{ meta }}</div>
        </div>
        <tab-badge
          [variant]="badge.variant ?? 'default'"
          [dot]="!!badge.dot">{{ badge.text }}</tab-badge>
      </div>

      <div class="bill-grid">
        <div class="cell">
          <div class="k">{{ primaryKey }}</div>
          <div class="v">
            <tab-amount [value]="primaryValue" size="md" [muted]="primaryMuted"></tab-amount>
          </div>
        </div>
        <div class="cell">
          <div class="k">{{ splitKey }}</div>
          <div class="v">
            <tab-amount [value]="splitValue" size="md"></tab-amount>
          </div>
        </div>
      </div>

      <div class="bill-actions">
        <tab-button full size="sm" (click)="primaryClick.emit()">{{ primaryAction }}</tab-button>
        <tab-button full size="sm" variant="ghost" (click)="secondaryClick.emit()">{{ secondaryAction }}</tab-button>
      </div>
    </tab-card>
  `,
  styleUrls: ['./bill-card.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class TabBillCardComponent {
  @Input() name = '';
  @Input() meta = '';
  @Input() badge!: { text: string; variant?: 'default' | 'quiet'; dot?: boolean };
  @Input() primaryKey = 'Expected';
  @Input() primaryValue = 0;
  @Input({ transform: booleanAttribute }) primaryMuted = false;
  @Input() splitKey = "Ray's half";
  @Input() splitValue = 0;
  @Input() primaryAction = 'Log this month';
  @Input() secondaryAction = 'Edit';
  @Output() primaryClick = new EventEmitter<void>();
  @Output() secondaryClick = new EventEmitter<void>();
}
```

## SCSS

```scss
@use '../tokens' as tokens;

:host { @include tokens.tab-tokens; display: block; height: 100%; }

::ng-deep tab-card { height: 100%; }
::ng-deep tab-card .card {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: var(--s-5);
}

.bill-top {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: var(--s-3);
  margin-bottom: var(--s-4);
}
.bill-name {
  font-size: clamp(16px, 0.4vw + 15px, 18px);
  font-weight: 600;
  color: var(--c-text-strong);
}
.bill-meta { color: var(--c-muted); font-size: 13px; margin-top: 2px; }

.bill-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--s-3);
  border-top: 1px solid var(--c-hairline);
  padding-top: var(--s-4);
}
.cell .k {
  color: var(--c-muted);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
}
.cell .v { margin-top: 4px; }

.bill-actions {
  display: flex; gap: var(--s-2);
  margin-top: auto;
  padding-top: var(--s-4);
}
```

## Acceptance criteria

- [ ] Card grows to fill column height when in the grid (equal-height row).
- [ ] Badge pinned top-right, baseline-aligned with name.
- [ ] Hairline divider above the key/value grid.
- [ ] Action row pinned to the bottom via `margin-top: auto`.
- [ ] Buttons use `full size="sm"` so both stretch equally.
- [ ] `primaryMuted` softens the "Last paid" amount on the Internet card variant.
