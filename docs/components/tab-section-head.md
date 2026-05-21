# tab-section-head

**Selector:** `tab-section-head`
**File:** `projects/components/src/lib/section-head/section-head.component.ts`
**Mock references:**
- Dashboard "Recent activity / See all" — `dashboard.html:41-46, 103-107`
- Settings "People / Preferences / Data" — `settings.html:13-22, 44-99`
- Loans month head — `loans.html:48-56`

**Used in:** dashboard, settings, loans (variant)

## Purpose

The pairing of an uppercase eyebrow title with an optional trailing element
(link or muted total). Two patterns appear:

1. **`h3` + link** — "Recent activity" / "See all" (dashboard)
2. **`h3` + monetary total** — "May 2026" / "+$198.42" (loans month head)
3. **`h3` only** — "People" (settings sections)

## Visual reference

```
RECENT ACTIVITY                  See all
^^ uppercase muted 600           ^^ var(--c-text) 13px

MAY 2026                         +$198.42
^^^ same                         ^^ var(--c-text) 13px tabular
```

## API

### Inputs
| Name | Type | Default | Description |
|---|---|---|---|
| `title` | `string` | `''` | Eyebrow title (rendered uppercase) |

### Content projection
- `trailing` — optional right-hand element (link, total, badge)

## Visual specs

Container:
- `display: flex; align-items: baseline; justify-content: space-between`
- `margin: var(--s-7) 0 var(--s-3)` for top-of-block use; allow `margin: 0 0 var(--s-3)` when first in column
- Settings variant: `margin: 0 0 var(--s-3) var(--s-2)` (slight left indent before card)

`h3`:
- `font-size: 12px`
- `letter-spacing: 0.14em`
- `text-transform: uppercase`
- `color: var(--c-muted)`
- `font-weight: 600`
- `margin: 0`

`[slot=trailing]` (link variant):
- `color: var(--c-text); font-size: 13px`

`[slot=trailing]` (total variant):
- `color: var(--c-text); font-size: 13px; font-variant-numeric: tabular-nums`

## Angular template

```ts
@Component({
  selector: 'tab-section-head',
  standalone: true,
  template: `
    <div class="head">
      <h3>{{ title }}</h3>
      <ng-content select="[slot=trailing]"></ng-content>
    </div>
  `,
  styleUrls: ['./section-head.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class TabSectionHeadComponent {
  @Input() title = '';
}
```

## SCSS

```scss
@use '../tokens' as tokens;

:host { @include tokens.tab-tokens; display: block; }

.head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin: 0 0 var(--s-3);
}

h3 {
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--c-muted);
  font-weight: 600;
  margin: 0;
}

::ng-deep .head > a {
  color: var(--c-text);
  font-size: 13px;
  text-decoration: none;
  &:hover { text-decoration: underline; text-underline-offset: 3px; }
}

::ng-deep .head > .total {
  color: var(--c-text);
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}
```

## Acceptance criteria

- [ ] Title uppercase, 12 px, `0.14em` tracking, muted, weight 600.
- [ ] Trailing slot baseline-aligned with the title.
- [ ] Renders identically whether trailing is a link, total span, or absent.
