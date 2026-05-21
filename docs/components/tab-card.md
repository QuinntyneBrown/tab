# tab-card

**Selector:** `tab-card`
**File:** `projects/components/src/lib/card/card.component.ts`
**Mock reference:** `docs/mocks/assets/js/components.js:88-111`
**Used in:** dashboard (hero, activity, summary), loans (rows wrapper), bills (each bill), settings (each section), statement (summary cells)

## Purpose

Surface container. Three padding sizes (`sm` / default / `lg`), plus `flat`
(transparent background, stronger border — used for the "month at a glance"
summary on dashboard) and `hero` (subtle vertical gradient — used for the hero
balance card on dashboard and the outstanding-balance stat on loans).

## Visual reference

```
default                 flat                    hero
┌──────────────┐        ┌──────────────┐        ┌──────────────┐
│ #313133 bg   │        │ transparent  │        │ gradient     │
│ 1px hairline │        │ stronger hl  │        │ 3A→31 vertical│
│ radius 16    │        │ radius 16    │        │ radius 16    │
│ padding 20   │        │ padding 20   │        │ padding 20   │
└──────────────┘        └──────────────┘        └──────────────┘
```

## API

### Inputs
| Name | Type | Default | Description |
|---|---|---|---|
| `padding` | `'sm' \| 'md' \| 'lg'` | `'md'` | `sm` = 14 px, `md` = 20 px, `lg` = 28 px |
| `flat` | `boolean` | `false` | Transparent fill, stronger border |
| `hero` | `boolean` | `false` | Vertical gradient (`#3A3A3D → #313133`) |

### Content projection
- Default slot: card body

## Visual specs

| Property | default | flat | hero |
|---|---|---|---|
| `background` | `var(--c-surface)` (#313133) | `transparent` | `linear-gradient(180deg, #3A3A3D 0%, #313133 100%)` |
| `border` | `1px solid var(--c-hairline)` | `1px solid var(--c-hairline-strong)` | `1px solid var(--c-hairline-strong)` |
| `border-radius` | `16px` | inherits | inherits |
| `padding` (md) | `20px` | inherits | inherits |
| `padding` (sm) | `14px` | inherits | inherits |
| `padding` (lg) | `28px` | inherits | inherits |

Host `display: block`. `hero` and `flat` are mutually exclusive in practice but
both can be set; `hero` wins for background.

## Angular template

```ts
@Component({
  selector: 'tab-card',
  standalone: true,
  template: `<div class="card" part="card"><ng-content></ng-content></div>`,
  styleUrls: ['./card.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    '[attr.padding]': 'padding === "md" ? null : padding',
    '[attr.flat]': 'flat ? "" : null',
    '[attr.hero]': 'hero ? "" : null',
  },
})
export class TabCardComponent {
  @Input() padding: 'sm' | 'md' | 'lg' = 'md';
  @Input({ transform: booleanAttribute }) flat = false;
  @Input({ transform: booleanAttribute }) hero = false;
}
```

## SCSS

```scss
@use '../tokens' as tokens;

:host {
  @include tokens.tab-tokens;
  display: block;
}

.card {
  background: var(--c-surface);
  border: 1px solid var(--c-hairline);
  border-radius: 16px;
  padding: 20px;
}

:host([padding='sm']) .card { padding: 14px; }
:host([padding='lg']) .card { padding: 28px; }

:host([flat]) .card {
  background: transparent;
  border-color: var(--c-hairline-strong);
}

:host([hero]) .card {
  background: linear-gradient(180deg, #3A3A3D 0%, #313133 100%);
  border-color: var(--c-hairline-strong);
}
```

## Acceptance criteria

- [ ] Default fill `#313133`, radius `16 px`, border = `--c-hairline`.
- [ ] `flat` removes fill and uses `--c-hairline-strong`.
- [ ] `hero` shows the exact two-stop linear gradient (`#3A3A3D` top, `#313133` bottom).
- [ ] Three padding sizes (`14 / 20 / 28 px`) match per `padding` attr.
- [ ] No internal margins — child stacks must be controlled by `.stack` utility from `base.css`.
