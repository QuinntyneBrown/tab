# tab-stat-card

**Selector:** `tab-stat-card`
**File:** `projects/components/src/lib/stat-card/stat-card.component.ts`
**Mock reference:** `docs/mocks/loans.html:21-28, 67-80`
**Used in:** loans summary strip

## Purpose

A small stat tile that pairs an uppercase muted key with a large monetary
value. Three of them sit side-by-side in the "summary strip" at the top of
loans. The first one is the `hero` variant — same vertical gradient as
`<tab-card hero>`.

## Visual reference

```
┌───────────────────┐  ┌────────────────┐  ┌────────────────┐
│ OUTSTANDING       │  │ THIS MONTH     │  │ PAID BACK YTD  │
│ $1,284.50         │  │ $198.42        │  │ $100.00        │
└───────────────────┘  └────────────────┘  └────────────────┘
hero (gradient)        default (surface)   default (surface)
```

Strip layout:
- Mobile: single column
- ≥ 720 px: `grid-template-columns: 1.4fr 1fr 1fr`

## API

### Inputs
| Name | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | required | Uppercase eyebrow label |
| `value` | `number` | required | Forwarded to `<tab-amount>` |
| `amountSize` | `'md' \| 'xl' \| '2xl'` | `'xl'` | `2xl` only on the hero/outstanding card |
| `muted` | `boolean` | `false` | Mute the amount (used for "Paid back YTD") |
| `hero` | `boolean` | `false` | Use the vertical gradient background |

## Visual specs

Default tile:
- `padding: var(--s-5)` (20 px)
- `background: var(--c-surface)`
- `border: 1px solid var(--c-hairline)`
- `border-radius: 14px`

`hero`:
- `background: linear-gradient(180deg, #3A3A3D 0%, #313133 100%)`
- `border-color: var(--c-hairline-strong)`

`.k` (label, internal):
- `font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em`
- `color: var(--c-muted); font-weight: 600; margin-bottom: 6px`

Value: `<tab-amount [value]="value" [size]="amountSize" [muted]="muted">`.

## Angular template

```ts
@Component({
  selector: 'tab-stat-card',
  standalone: true,
  imports: [TabAmountComponent],
  template: `
    <div class="stat" [class.hero]="hero">
      <div class="k">{{ label }}</div>
      <tab-amount [value]="value" [size]="amountSize" [muted]="muted"></tab-amount>
    </div>
  `,
  styleUrls: ['./stat-card.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class TabStatCardComponent {
  @Input() label = '';
  @Input() value = 0;
  @Input() amountSize: 'md' | 'xl' | '2xl' = 'xl';
  @Input({ transform: booleanAttribute }) muted = false;
  @Input({ transform: booleanAttribute }) hero = false;
}
```

## SCSS

```scss
@use '../tokens' as tokens;

:host { @include tokens.tab-tokens; display: block; }

.stat {
  padding: var(--s-5);
  background: var(--c-surface);
  border: 1px solid var(--c-hairline);
  border-radius: 14px;
}

.stat.hero {
  background: linear-gradient(180deg, #3A3A3D 0%, #313133 100%);
  border-color: var(--c-hairline-strong);
}

.k {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--c-muted);
  font-weight: 600;
  margin-bottom: 6px;
}
```

## Container (`.summary-strip`) — page level

```scss
.summary-strip {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--s-3);
  margin-bottom: var(--s-5);
}
@media (min-width: 720px) {
  .summary-strip { grid-template-columns: 1.4fr 1fr 1fr; }
}
```

This grid lives on the page (`loans` component), not in the stat-card itself.

## Acceptance criteria

- [ ] Default fill `--c-surface`, radius `14 px`, hairline border.
- [ ] `hero` uses exact `#3A3A3D → #313133` gradient.
- [ ] Label `11 px`, `0.12em` tracking, muted 600.
- [ ] `amountSize="2xl"` on the hero card, `xl` on the others (matches mock).
- [ ] `muted` softens the "Paid back YTD" amount as in the mock.
