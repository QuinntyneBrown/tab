# tab-eyebrow

**Selector:** `tab-eyebrow`
**File:** `projects/components/src/lib/eyebrow/eyebrow.component.ts`
**Mock references:**
- Utility `.eyebrow` in `base.css:140-146`
- Hero eyebrow `dashboard.html:36`
- Stat key `loans.html:27`
- Section head `dashboard.html:45`
- Bill grid key `bills.html:42`
- Ledger head / summary key `statement.html:51-65, 132-136`

**Used in:** dashboard, loans, bills, statement, settings — every uppercase muted label

## Purpose

The tiny uppercase muted label that appears above hero amounts, stat values,
ledger column headers, and section titles. Reusing one component for these
ensures consistent tracking, weight, and color across the app.

## Visual reference

```
UNCLE RAY OWES                 ← eyebrow
$1,284.50

OUTSTANDING                    ← stat key
$1,284.50

ITEM   TOTAL   YOUR SHARE      ← ledger heads
```

## API

### Inputs
| Name | Type | Default | Description |
|---|---|---|---|
| `size` | `'xs' \| 'sm'` | `'sm'` | `xs` = 11 px (stat keys, ledger heads); `sm` = 12 px (section heads, hero eyebrow) |
| `tracking` | `'tight' \| 'loose'` | `'loose'` | `tight`=0.10em; `loose`=0.12em (matches `.eyebrow`); `extra` not currently needed |

### Content projection
- Default slot: the label text

## Visual specs

Host:
- `display: block`
- `text-transform: uppercase`
- `color: var(--c-muted)`
- `font-weight: 600`
- `font-family: var(--font-sans)`
- `font-size: 12px` (sm)
- `letter-spacing: 0.12em` (loose)

Variants observed in mocks:
| Variant | font-size | letter-spacing | Notes |
|---|---|---|---|
| Hero eyebrow (dashboard) | `var(--fs-xs)` ≈ 11–12 px | `0.14em` | use `size="sm"` + `tracking="extra"` if you add a third tracking |
| Section head h3 | 12 px | `0.14em` | same |
| Stat key | 11 px | `0.12em` | `size="xs"` `tracking="loose"` |
| Bill cell key | 12 px | `0.08em` | `size="sm"` `tracking="tight"` |
| Ledger head | 11 px | `0.12em` | `size="xs"` `tracking="loose"` |

> Recommend supporting `tracking="snug" (0.08em) | loose (0.12em) | extra (0.14em)`.

## Angular template

```ts
@Component({
  selector: 'tab-eyebrow',
  standalone: true,
  template: `<ng-content></ng-content>`,
  styleUrls: ['./eyebrow.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    '[attr.size]': 'size === "sm" ? null : size',
    '[attr.tracking]': 'tracking === "loose" ? null : tracking',
  },
})
export class TabEyebrowComponent {
  @Input() size: 'xs' | 'sm' = 'sm';
  @Input() tracking: 'snug' | 'loose' | 'extra' = 'loose';
}
```

## SCSS

```scss
@use '../tokens' as tokens;

:host {
  @include tokens.tab-tokens;
  display: block;
  text-transform: uppercase;
  color: var(--c-muted);
  font-weight: 600;
  font-family: var(--font-sans);
  font-size: 12px;
  letter-spacing: 0.12em;
  line-height: 1.2;
}

:host([size='xs']) { font-size: 11px; }

:host([tracking='snug'])  { letter-spacing: 0.08em; }
:host([tracking='extra']) { letter-spacing: 0.14em; }
```

## Acceptance criteria

- [ ] Color always `--c-muted`; weight 600; uppercase.
- [ ] Two sizes available (11 / 12 px) matching all four mock variants.
- [ ] Three trackings (0.08 / 0.12 / 0.14 em).
- [ ] No fluid scaling — kept fixed for crispness.
