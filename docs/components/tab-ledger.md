# tab-ledger

**Selector:** `tab-ledger` (with `tab-ledger-row` for child rows)
**File:** `projects/components/src/lib/ledger/ledger.component.ts`
**Mock reference:** `docs/mocks/statement.html:54-80, 132-172`
**Used in:** statement

## Purpose

Read-only line-item table used on the shareable statement. Three-column grid
header ("Item / Total / Your share"), each row mirrors the columns with the
left as `desc` + `when`, and the right two as right-aligned tabular numerals.
Subtle hairlines between rows.

## Visual reference

```
ITEM                                     TOTAL    YOUR SHARE
─────────────────────────────────────────────────────────────
Groceries — Loblaws                      —        $120.00
May 18 · cash loan
─────────────────────────────────────────────────────────────
Hydro — April                            $156.84  $78.42
May 02 · shared bill
```

## API — `<tab-ledger>`

### Content projection
- Default slot: one or more `<tab-ledger-row>` children
- (Optional) `header` slot — custom column labels; otherwise default labels rendered

### Inputs
| Name | Type | Default | Description |
|---|---|---|---|
| `itemHead` | `string` | `'Item'` | Left column header |
| `totalHead` | `string` | `'Total'` | Middle column header |
| `shareHead` | `string` | `'Your share'` | Right column header |

## API — `<tab-ledger-row>`

### Inputs
| Name | Type | Default | Description |
|---|---|---|---|
| `desc` | `string` | required | Main description |
| `when` | `string` | required | Date/method line |
| `total` | `number \| null` | `null` | Middle value; if null, renders `—` muted |
| `share` | `number` | required | Right value |
| `shareSign` | `string \| null` | `null` | Optional sign prefix (`'−'`) for the share |

## Visual specs

### Header (`.ledger-head`)
- `display: grid; grid-template-columns: 1fr 90px 100px`
- `gap: var(--s-3)`
- `font-size: 11px`
- `text-transform: uppercase; letter-spacing: 0.12em`
- `color: var(--c-muted); font-weight: 600`
- `padding: 0 var(--s-2) var(--s-2)`
- `border-bottom: 1px solid var(--c-hairline-strong)`
- `.num` cells: `text-align: right`

### Row (`.ledger-row`)
- `display: grid; grid-template-columns: 1fr 90px 100px`
- `gap: var(--s-3)`
- `align-items: baseline`
- `padding: var(--s-3) var(--s-2)`
- `border-bottom: 1px solid var(--c-hairline)`
- `font-size: 14px`

`.num`:
- `text-align: right`
- `font-variant-numeric: tabular-nums`
- `font-family: var(--font-num)`
- `font-weight: 500`
- `color: var(--c-text-strong)`

`.num.muted` (when `total` is null): `color: var(--c-muted); font-weight: 400`.

`.desc`:
- `color: var(--c-text)`
- `.when` inside: `color: var(--c-muted); font-size: 12px; display: block; margin-top: 2px`

## Angular templates

```ts
@Component({
  selector: 'tab-ledger',
  standalone: true,
  template: `
    <div class="ledger-head">
      <span>{{ itemHead }}</span>
      <span class="num">{{ totalHead }}</span>
      <span class="num">{{ shareHead }}</span>
    </div>
    <ng-content></ng-content>
  `,
  styleUrls: ['./ledger.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class TabLedgerComponent {
  @Input() itemHead = 'Item';
  @Input() totalHead = 'Total';
  @Input() shareHead = 'Your share';
}

@Component({
  selector: 'tab-ledger-row',
  standalone: true,
  imports: [NgIf],
  template: `
    <div class="ledger-row">
      <div class="desc">
        {{ desc }}<span class="when">{{ when }}</span>
      </div>
      <div class="num" [class.muted]="total === null">
        {{ total === null ? '—' : formatted(total) }}
      </div>
      <div class="num">
        <ng-container *ngIf="shareSign">{{ shareSign }}</ng-container>{{ formatted(share) }}
      </div>
    </div>
  `,
  styleUrls: ['./ledger.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class TabLedgerRowComponent {
  @Input() desc = '';
  @Input() when = '';
  @Input() total: number | null = null;
  @Input() share = 0;
  @Input() shareSign: string | null = null;

  formatted(n: number) {
    return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}
```

> Numbers are formatted inline (rather than via `<tab-amount>`) because the
> statement uses a plain text rendering with embedded `$` glyph — no
> superscripted cents — to look like a printed ledger.

## SCSS

```scss
@use '../tokens' as tokens;

:host { @include tokens.tab-tokens; display: block; }

.ledger-head {
  display: grid;
  grid-template-columns: 1fr 90px 100px;
  gap: var(--s-3);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--c-muted);
  padding: 0 var(--s-2) var(--s-2);
  font-weight: 600;
  border-bottom: 1px solid var(--c-hairline-strong);

  .num { text-align: right; }
}

.ledger-row {
  display: grid;
  grid-template-columns: 1fr 90px 100px;
  gap: var(--s-3);
  align-items: baseline;
  padding: var(--s-3) var(--s-2);
  border-bottom: 1px solid var(--c-hairline);
  font-size: 14px;

  .num {
    text-align: right;
    font-variant-numeric: tabular-nums;
    font-family: var(--font-num);
    font-weight: 500;
    color: var(--c-text-strong);

    &.muted { color: var(--c-muted); font-weight: 400; }
  }
  .desc {
    color: var(--c-text);

    .when {
      color: var(--c-muted);
      font-size: 12px;
      display: block;
      margin-top: 2px;
    }
  }
}
```

## Print

The statement screen sets `@media print { tab-header, .actions { display: none } }`.
Ledger rows are unaffected — they print as-is with the colors intact (the page
mock relies on the dark background for screen; for print parity, expose a
`@media print` rule on the host that swaps colors if a light print is desired).
Defer until a print-specific spec is signed off.

## Acceptance criteria

- [ ] 3-column grid `1fr 90px 100px` with 12 px gap.
- [ ] Header uses `--c-hairline-strong` underline; rows use `--c-hairline`.
- [ ] Numbers right-aligned, num font, tabular numerals.
- [ ] `total === null` renders an em-dash in muted weight 400.
- [ ] `shareSign` prefixes the value (used for payment-in: `−$100.00`).
- [ ] Description meta (`.when`) wraps to second line, muted 12 px.
