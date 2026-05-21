# tab-badge

**Selector:** `tab-badge`
**File:** `projects/components/src/lib/badge/badge.component.ts`
**Mock reference:** `docs/mocks/assets/js/components.js:291-319`
**Used in:** bills cards — "Due in 4d" (default), "Next: Jun 03" (quiet)

## Purpose

Pill status indicator. Three appearance variants (`default` / `strong` / `quiet`)
and an optional leading `dot` glyph. Used to mark recurring bill status without
introducing semantic color.

## Visual reference

```
default                      strong                       quiet
( · DUE IN 4D )              ( PAID )                     ( NEXT: JUN 03 )
elevated bg, hairline-strong  surface bg, text-strong      transparent, hairline only
```

## API

### Inputs
| Name | Type | Default | Description |
|---|---|---|---|
| `variant` | `'default' \| 'strong' \| 'quiet'` | `'default'` | Appearance |
| `dot` | `boolean` | `false` | Show a 6 px leading dot |

### Content projection
- Default slot: label text (rendered uppercase via CSS — caller should pass natural case)

## Visual specs

Host:

| Property | Value |
|---|---|
| `display` | `inline-flex; align-items: center` |
| `gap` | `6px` |
| `padding` | `4px 10px` |
| `border-radius` | `999px` |
| `background` | `var(--c-elevated)` |
| `border` | `1px solid var(--c-hairline-strong)` |
| `color` | `var(--c-text)` |
| `font-size` | `11px` |
| `font-weight` | `600` |
| `letter-spacing` | `0.04em` |
| `text-transform` | `uppercase` |
| `font-family` | `var(--font-sans)` |

`strong`: `color: var(--c-text-strong); background: var(--c-surface)`
`quiet`: `background: transparent; color: var(--c-muted); border-color: var(--c-hairline)`

`.dot`: `width: 6px; height: 6px; border-radius: 50%; background: currentColor; opacity: 0.7`.

## Angular template

```ts
@Component({
  selector: 'tab-badge',
  standalone: true,
  template: `
    <span class="dot" *ngIf="dot"></span>
    <ng-content></ng-content>
  `,
  styleUrls: ['./badge.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    '[attr.strong]': 'variant === "strong" ? "" : null',
    '[attr.quiet]':  'variant === "quiet" ? "" : null',
  },
})
export class TabBadgeComponent {
  @Input() variant: 'default' | 'strong' | 'quiet' = 'default';
  @Input({ transform: booleanAttribute }) dot = false;
}
```

> Mirrors the mock's `[strong]` / `[quiet]` boolean attribute selectors so the
> shadow-DOM CSS can stay identical.

## SCSS

```scss
@use '../tokens' as tokens;

:host {
  @include tokens.tab-tokens;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--c-elevated);
  border: 1px solid var(--c-hairline-strong);
  color: var(--c-text);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-family: var(--font-sans);
}

:host([strong]) { color: var(--c-text-strong); background: var(--c-surface); }
:host([quiet])  { background: transparent; color: var(--c-muted); border-color: var(--c-hairline); }

.dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.7;
}
```

## Acceptance criteria

- [ ] Pill radius, 4×10 padding, 11 px uppercase font.
- [ ] Three variants render correct background/border/text combinations.
- [ ] `dot` adds a 6 px circle that inherits text color via `currentColor`.
- [ ] No semantic color (red/green/yellow) under any variant.
