# tab-amount

**Selector:** `tab-amount`
**File:** `projects/components/src/lib/amount/amount.component.ts`
**Mock reference:** `docs/mocks/assets/js/components.js:197-258`
**Used in:** every screen with money — dashboard hero, loans rows, bills cells, statement totals

## Purpose

Renders a money value with **tabular numerals** and a three-part composition:
superscripted currency glyph, large whole number, superscripted cents. Sizes
range from `sm` (15 px) to `hero` (clamped 48 → 88 px). The optional `sign`
slot renders a `−` (or any string) in front, muted; `muted` modifier softens
both currency and cents to `--c-text-faint`.

## Visual reference

```
hero (dashboard balance):
$1,284.50      ← '$' raised, half size, muted
                 '1,284' = whole, 500 weight, hero size
                 '.50' = cents, half size, raised, muted

with sign (payment received):
−$100.00       ← '−' before, muted
```

## API

### Inputs
| Name | Type | Default | Description |
|---|---|---|---|
| `value` | `number` | `0` | Decimal value (e.g. `1284.50`) |
| `size` | `'sm' \| 'md' \| 'xl' \| '2xl' \| 'hero'` | `'md'` | Type scale |
| `currency` | `string` | `'$'` | Glyph (`'$'`, `'€'`, `'CA$'`, etc.) |
| `sign` | `string \| null` | `null` | Optional sign prefix (`'−'`, `'+'`) |
| `muted` | `boolean` | `false` | Softens currency and cents to `--c-text-faint`, base to `--c-muted` |

### Computed render
```
abs = |value|
whole = floor(abs).toLocaleString('en-US')   // grouping commas
cents = (abs - floor(abs)).toFixed(2).slice(2)  // '50' for .50
```

(Sign is **not** auto-derived from value's sign — the caller passes `sign` so the
mocks can stay unopinionated about color-coded signaling.)

## Visual specs

Host:
- `display: inline-flex; align-items: baseline`
- `font-family: var(--font-num)`
- `font-variant-numeric: tabular-nums`
- `font-weight: 500`
- `color: var(--c-text-strong)`
- `letter-spacing: -0.02em`
- `line-height: 1`

Spans:
| Span | Spec |
|---|---|
| `.sign` | `color: var(--c-muted); margin-right: 0.08em` |
| `.currency` | `font-size: 0.55em; color: var(--c-muted); font-weight: 600; margin-right: 0.12em; transform: translateY(-0.45em)` |
| `.whole` | `font-weight: 500` |
| `.cents` | `font-size: 0.5em; color: var(--c-muted); font-weight: 500; margin-left: 0.08em; transform: translateY(-0.45em)` |

Sizes (host font-size):
| size | value |
|---|---|
| `hero` | `clamp(48px, 7vw + 16px, 88px)` |
| `2xl`  | `clamp(32px, 3vw + 18px, 52px)` |
| `xl`   | `clamp(24px, 1.4vw + 18px, 32px)` |
| `md`   | `clamp(16px, 0.4vw + 15px, 20px)` |
| `sm`   | `clamp(13px, 0.2vw + 12px, 15px)` |

`muted` host:
- `color: var(--c-muted)`
- `.cents`, `.currency` → `color: var(--c-text-faint)`

## Angular template

```ts
@Component({
  selector: 'tab-amount',
  standalone: true,
  template: `
    <span class="sign" *ngIf="sign">{{ sign }}</span>
    <span class="currency">{{ currency }}</span>
    <span class="whole">{{ whole }}</span>
    <span class="cents">.{{ cents }}</span>
  `,
  styleUrls: ['./amount.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    '[attr.size]': 'size === "md" ? null : size',
    '[attr.muted]': 'muted ? "" : null',
  },
})
export class TabAmountComponent {
  @Input() value = 0;
  @Input() size: 'sm' | 'md' | 'xl' | '2xl' | 'hero' = 'md';
  @Input() currency = '$';
  @Input() sign: string | null = null;
  @Input({ transform: booleanAttribute }) muted = false;

  get whole(): string {
    const abs = Math.abs(Number(this.value) || 0);
    return Math.floor(abs).toLocaleString('en-US');
  }
  get cents(): string {
    const abs = Math.abs(Number(this.value) || 0);
    return (abs - Math.floor(abs)).toFixed(2).slice(2);
  }
}
```

## SCSS

```scss
@use '../tokens' as tokens;

:host {
  @include tokens.tab-tokens;
  display: inline-flex;
  align-items: baseline;
  font-family: var(--font-num);
  font-variant-numeric: tabular-nums;
  color: var(--c-text-strong);
  font-weight: 500;
  letter-spacing: -0.02em;
  line-height: 1;
}

.sign     { color: var(--c-muted); margin-right: 0.08em; }
.currency { font-size: 0.55em; color: var(--c-muted); margin-right: 0.12em; font-weight: 600; transform: translateY(-0.45em); }
.whole    { font-weight: 500; }
.cents    { font-size: 0.5em; color: var(--c-muted); margin-left: 0.08em; transform: translateY(-0.45em); font-weight: 500; }

:host([size='hero']) { font-size: clamp(48px, 7vw + 16px, 88px); }
:host([size='2xl'])  { font-size: clamp(32px, 3vw + 18px, 52px); }
:host([size='xl'])   { font-size: clamp(24px, 1.4vw + 18px, 32px); }
:host([size='md'])   { font-size: clamp(16px, 0.4vw + 15px, 20px); }
:host([size='sm'])   { font-size: clamp(13px, 0.2vw + 12px, 15px); }

:host([muted])        { color: var(--c-muted); }
:host([muted]) .cents,
:host([muted]) .currency { color: var(--c-text-faint); }
```

## Accessibility

- Wrap with `aria-label="$1,284.50"` on host when used as a standalone value
  outside a labeled context — screen readers otherwise read each span piecewise.
- Host should expose `role="text"` if it sits inside an interactive row.

## Acceptance criteria

- [ ] Whole number uses thousands separator (`1,284`).
- [ ] Cents always two digits, always rendered (even `.00`).
- [ ] Currency and cents raise to baseline via `translateY(-0.45em)` and use half-ish sizes (0.55 / 0.50).
- [ ] All 5 sizes use the exact `clamp()` values.
- [ ] `muted` softens both, no color signaling for positive/negative.
- [ ] Tabular numerals visible (digits align column-wise across rows in loans / statement).
