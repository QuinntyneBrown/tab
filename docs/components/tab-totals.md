# tab-totals

**Selector:** `tab-totals` (with `tab-totals-row` children)
**File:** `projects/components/src/lib/totals/totals.component.ts`
**Mock reference:** `docs/mocks/statement.html:82-101, 174-179`
**Used in:** statement (below the ledger)

## Purpose

Summary rows that sit below the ledger and culminate in a final "Balance owing"
row. Each row is a label/amount pair separated by space-between. A stronger
hairline above the final row visually separates the running total from the
sub-categories.

## Visual reference

```
─────────────────────────────────────────  hairline-strong
Loans                              $505.00
Shared bills (your half)           $879.50
Payments applied                  −$100.00
─────────────────────────────────────────  hairline-strong
Balance owing                    $1,284.50  ← xl, strong label
```

## API — `<tab-totals>`

### Content projection
- Default slot: one or more `<tab-totals-row>` children

## API — `<tab-totals-row>`

### Inputs
| Name | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | required | Left label |
| `value` | `number` | required | Right amount |
| `sign` | `string \| null` | `null` | Optional sign for the amount (`'−'`) |
| `muted` | `boolean` | `false` | Mute the amount |
| `amountSize` | `'md' \| 'xl'` | `'md'` | `xl` for the final row |
| `labelStrong` | `boolean` | `false` | Use `--c-text-strong` on the label (final row) |
| `final` | `boolean` | `false` | Apply top margin + strong divider above the row |

## Visual specs

`tab-totals` host:
- `display: block`
- `margin-top: var(--s-6)`
- `padding-top: var(--s-4)`
- `border-top: 1px solid var(--c-hairline-strong)`

`tab-totals-row` `.row`:
- `display: flex; justify-content: space-between; align-items: baseline`
- `padding: var(--s-2) var(--s-2)`

`.row.final`:
- `margin-top: var(--s-3)`
- `padding-top: var(--s-4)`
- `border-top: 1px solid var(--c-hairline-strong)`

Label muted (default) or strong (`labelStrong`).
Amount via `<tab-amount>`.

## Angular templates

```ts
@Component({
  selector: 'tab-totals',
  standalone: true,
  template: `<ng-content></ng-content>`,
  styleUrls: ['./totals.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class TabTotalsComponent {}

@Component({
  selector: 'tab-totals-row',
  standalone: true,
  imports: [TabAmountComponent],
  template: `
    <div class="row" [class.final]="final">
      <span [class.strong]="labelStrong" [class.muted]="!labelStrong">{{ label }}</span>
      <tab-amount
        [value]="value"
        [size]="amountSize"
        [muted]="muted"
        [sign]="sign"></tab-amount>
    </div>
  `,
  styleUrls: ['./totals.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class TabTotalsRowComponent {
  @Input() label = '';
  @Input() value = 0;
  @Input() sign: string | null = null;
  @Input({ transform: booleanAttribute }) muted = false;
  @Input() amountSize: 'md' | 'xl' = 'md';
  @Input({ transform: booleanAttribute }) labelStrong = false;
  @Input({ transform: booleanAttribute }) final = false;
}
```

## SCSS

```scss
@use '../tokens' as tokens;

:host { @include tokens.tab-tokens; display: block; }

tab-totals {
  display: block;
  margin-top: var(--s-6);
  padding-top: var(--s-4);
  border-top: 1px solid var(--c-hairline-strong);
}

.row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: var(--s-2) var(--s-2);

  &.final {
    margin-top: var(--s-3);
    padding-top: var(--s-4);
    border-top: 1px solid var(--c-hairline-strong);
  }

  .muted  { color: var(--c-muted); }
  .strong { color: var(--c-text-strong); font-weight: 600; }
}
```

## Acceptance criteria

- [ ] Hairline-strong top border above the totals block.
- [ ] Each subtotal row is muted label + `md`-sized amount.
- [ ] `final` row gets its own hairline-strong above, `xl` amount, strong label.
- [ ] `sign="−"` renders before the amount via `<tab-amount>` sign slot.
- [ ] `muted` softens the amount (used for "Payments applied").
