# tab-month-section

**Selector:** `tab-month-section`
**File:** `projects/components/src/lib/month-section/month-section.component.ts`
**Mock reference:** `docs/mocks/loans.html:39-57, 91-159`
**Used in:** loans (one section per month grouping)

## Purpose

Composition wrapper around the loans-by-month pattern. Header shows the month
name (uppercase muted) and a small monetary total on the right; body holds a
`<tab-card padding="sm">` containing `<tab-row>` items.

The wrapping `.months` grid itself becomes single-column on mobile and
two-column at ≥ 1080 px.

## Visual reference

```
MAY 2026                                  +$198.42
┌────────────────────────────────────────┐
│ ●G  Groceries — Loblaws         $120.00 │
│     May 18 · cash                       │
│ ───────────────────────────────────     │
│ ●H  Hydro — April               $78.42  │
│     May 02 · half of $156.84            │
└────────────────────────────────────────┘
```

## API

### Inputs
| Name | Type | Default | Description |
|---|---|---|---|
| `monthLabel` | `string` | required | Month title (e.g. "May 2026") |
| `total` | `string` | required | Pre-formatted total string (e.g. `'+$198.42'`, `'−$59.50'`) — sign authored by caller so the component stays unopinionated |

### Content projection
- Default slot: one or more `<tab-row>` children (placed inside an internal `<tab-card padding="sm">`)

## Visual specs

`.month-head`:
- `display: flex; align-items: baseline; justify-content: space-between`
- `margin: 0 0 var(--s-3)`
- `padding: 0 var(--s-1)`

`h3` (month label):
- `font-size: 12px`
- `letter-spacing: 0.14em; text-transform: uppercase`
- `color: var(--c-muted)`
- `font-weight: 600`
- `margin: 0`

`.total`:
- `color: var(--c-text)`
- `font-size: 13px`
- `font-variant-numeric: tabular-nums`

Inner card uses `<tab-card padding="sm">` (14 px padding).

## Container — page level

```scss
.months {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--s-6);
}
@media (min-width: 1080px) {
  .months {
    grid-template-columns: 1fr 1fr;
    gap: var(--s-7);
  }
}
```

This grid lives on the loans page (`loans` component), not in the
month-section itself.

## Angular template

```ts
@Component({
  selector: 'tab-month-section',
  standalone: true,
  imports: [TabCardComponent],
  template: `
    <section>
      <div class="month-head">
        <h3>{{ monthLabel }}</h3>
        <span class="total">{{ total }}</span>
      </div>
      <tab-card padding="sm">
        <ng-content></ng-content>
      </tab-card>
    </section>
  `,
  styleUrls: ['./month-section.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class TabMonthSectionComponent {
  @Input() monthLabel = '';
  @Input() total = '';
}
```

## SCSS

```scss
@use '../tokens' as tokens;

:host { @include tokens.tab-tokens; display: block; }

.month-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin: 0 0 var(--s-3);
  padding: 0 var(--s-1);
}

h3 {
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--c-muted);
  font-weight: 600;
  margin: 0;
}

.total {
  color: var(--c-text);
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}
```

## Acceptance criteria

- [ ] Month label uppercase muted with `0.14em` tracking.
- [ ] Total renders in tabular numerals — sign authored by caller (no color signaling).
- [ ] Inner card uses `sm` padding so rows breathe at 14 px.
- [ ] On the last row inside the card, callers set `[last]` on `<tab-row>` to drop the divider.
