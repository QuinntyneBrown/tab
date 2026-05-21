# tab-avatar

**Selector:** `tab-avatar`
**File:** `projects/components/src/lib/avatar/avatar.component.ts`
**Mock reference:** `docs/mocks/assets/js/components.js:260-289`
**Used in:** dashboard topbar (sm), dashboard activity rows (default), loans rows, settings people cards (lg)

## Purpose

Initials avatar — circular elevated tile with 1–2 uppercase letters derived from
a name. Three sizes: `sm` (28 px), default (36 px), `lg` (56 px). No images,
no color signaling.

## Visual reference

```
sm (28px)        default (36px)        lg (56px)
 ┌──┐              ┌────┐                ┌──────┐
 │QB│              │ QB │                │  QB  │
 └──┘              └────┘                └──────┘
```

## API

### Inputs
| Name | Type | Default | Description |
|---|---|---|---|
| `name` | `string` | `'?'` | Full name; first letter of first two words is used |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tile size |

### Computed render
```
initials = name.split(/\s+/).slice(0, 2).map(w => w[0] || '').join('').toUpperCase();
```

## Visual specs

Host `display: inline-flex`.

`.a` (the tile):

| Property | Value (md) |
|---|---|
| `width` / `height` | `36px` |
| `border-radius` | `50%` |
| `background` | `var(--c-elevated)` (#3A3A3D) |
| `border` | `1px solid var(--c-hairline-strong)` |
| `display` | `grid; place-items: center` |
| `color` | `var(--c-text-strong)` |
| `font-weight` | `600` |
| `font-size` | `13px` |
| `letter-spacing` | `0.02em` |

Size variants:
- `sm`: `width/height: 28px; font-size: 11px`
- `lg`: `width/height: 56px; font-size: 18px`

## Angular template

```ts
@Component({
  selector: 'tab-avatar',
  standalone: true,
  template: `<div class="a">{{ initials }}</div>`,
  styleUrls: ['./avatar.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
  host: { '[attr.size]': 'size === "md" ? null : size' },
})
export class TabAvatarComponent {
  @Input() name = '?';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  get initials(): string {
    return (this.name || '?')
      .split(/\s+/).slice(0, 2)
      .map(w => w[0] || '').join('').toUpperCase();
  }
}
```

## SCSS

```scss
@use '../tokens' as tokens;

:host { @include tokens.tab-tokens; display: inline-flex; }

.a {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: var(--c-elevated);
  border: 1px solid var(--c-hairline-strong);
  display: grid; place-items: center;
  color: var(--c-text-strong);
  font-weight: 600;
  font-size: 13px;
  letter-spacing: 0.02em;
}

:host([size='lg']) .a { width: 56px; height: 56px; font-size: 18px; }
:host([size='sm']) .a { width: 28px; height: 28px; font-size: 11px; }
```

## Accessibility

- Host should carry `aria-label="{{ name }}"` and `role="img"`.
- Initials are visual only; the full name is what assistive tech announces.

## Acceptance criteria

- [ ] Initials computed from up to 2 first-letters of name words, uppercased.
- [ ] Three exact sizes (28 / 36 / 56 px) match mocks.
- [ ] `--c-elevated` fill, `--c-hairline-strong` border, perfectly circular.
