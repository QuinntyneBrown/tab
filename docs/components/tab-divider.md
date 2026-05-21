# tab-divider

**Selector:** `tab-divider`
**File:** `projects/components/src/lib/divider/divider.component.ts`
**Mock reference:** `docs/mocks/assets/js/components.js:372-382`
**Used in:** dashboard summary card, statement totals

## Purpose

A 1 px horizontal hairline with 16 px vertical breathing room. `strong` variant
uses `--c-hairline-strong` for grouping breaks (e.g. before the "Net change"
row in the monthly summary).

## Visual reference

```
————————————————————   default (hairline 0.08 alpha)
====================   strong  (hairline 0.16 alpha)
```

## API

### Inputs
| Name | Type | Default | Description |
|---|---|---|---|
| `strong` | `boolean` | `false` | Use `--c-hairline-strong` |

## Visual specs

Host:
- `display: block`
- `height: 1px`
- `background: var(--c-hairline)` (default) or `var(--c-hairline-strong)` when `[strong]`
- `margin: 16px 0`

## Angular template

```ts
@Component({
  selector: 'tab-divider',
  standalone: true,
  template: '',
  styleUrls: ['./divider.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    'role': 'separator',
    'aria-orientation': 'horizontal',
    '[attr.strong]': 'strong ? "" : null',
  },
})
export class TabDividerComponent {
  @Input({ transform: booleanAttribute }) strong = false;
}
```

## SCSS

```scss
@use '../tokens' as tokens;

:host {
  @include tokens.tab-tokens;
  display: block;
  height: 1px;
  background: var(--c-hairline);
  margin: 16px 0;
}

:host([strong]) { background: var(--c-hairline-strong); }
```

## Acceptance criteria

- [ ] Exact 1 px height; sits flush with 16 px above and below.
- [ ] `strong` doubles visual weight via `--c-hairline-strong`.
- [ ] Exposes `role="separator"` for assistive tech.
