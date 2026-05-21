# tab-header

**Selector:** `tab-header`
**File:** `projects/components/src/lib/header/header.component.ts`
**Mock reference:** `docs/mocks/assets/js/components.js:384-460`
**Used in:** loans, bills, add, statement, settings

## Purpose

Top bar with three slots in a sticky-on-mobile / static-on-desktop header. On
mobile/tablet it's a centered title with a 40 px round back chevron on the left
and an optional `action` slot on the right. On desktop (≥ 960 px) it collapses
to a left-aligned page title (back chevron disappears — the nav rail handles
navigation) with the `action` slot still pinned to the right.

## Visual reference

```
Mobile (sticky):
┌──────────────────────────────────────────┐
│  ⟨    Loans                       [+ Add]│
└──────────────────────────────────────────┘
sticky top:0 bg var(--c-bg)

Desktop:
                                       [Share]
Loans
^ left aligned 22-28px h1
```

## API

### Inputs
| Name | Type | Default | Description |
|---|---|---|---|
| `title` | `string` | `''` | Page title |
| `back` | `boolean` | `false` | Show the back chevron (mobile only) |
| `href` | `string` | `'#'` | Back link href (use `routerLink` in Angular variant — see below) |
| `backRouterLink` | `string \| any[] \| null` | `null` | Optional Angular router link (overrides `href`) |

### Content projection
- `action` — right-side action element (typically `<tab-button variant="quiet" size="sm">`)

## Visual specs

Mobile header (default):
- `display: grid`
- `grid-template-columns: 40px 1fr 40px`
- `align-items: center`
- `gap: 12px`
- `padding: 16px clamp(16px, 4vw, 56px) 8px`
- `background: var(--c-bg)`
- `position: sticky; top: 0; z-index: 5`

`.title`:
- `text-align: center`
- `font-size: clamp(14px, 0.3vw + 13px, 16px)`
- `font-weight: 600`
- `color: var(--c-text-strong)`
- `letter-spacing: -0.005em`

`a.back`:
- `40 × 40 px; display: grid; place-items: center`
- `color: var(--c-text); border-radius: 999px; text-decoration: none`
- hover: `background: var(--c-elevated); color: var(--c-text-strong)`
- SVG `arrow`: `18 × 18 px`, path `M15 6l-6 6 6 6`, stroke `currentColor`, stroke-width `1.8`, round caps/joins

`.spacer` (right when no `action`): `width: 40px` (keeps title centered).

`[slot=action]`: `justify-self: end`.

Desktop (`@media (min-width: 960px)`):
- header `grid-template-columns: 1fr auto`
- `padding: 32px clamp(24px, 4vw, 56px) 16px`
- `background: transparent; position: static`
- `a.back { display: none }`
- `.title { text-align: left; font-size: clamp(22px, 1vw + 18px, 28px); font-weight: 600; letter-spacing: -0.02em }`
- `.spacer { display: none }`

## Angular template

```ts
@Component({
  selector: 'tab-header',
  standalone: true,
  imports: [RouterLink, NgIf],
  template: `
    <header>
      <a class="back" *ngIf="back; else spacer"
         [routerLink]="backRouterLink ?? null"
         [attr.href]="backRouterLink ? null : href">
        <svg class="arrow" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="1.8"
             stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 6l-6 6 6 6"/>
        </svg>
      </a>
      <ng-template #spacer><div class="spacer"></div></ng-template>

      <div class="title">{{ title }}</div>

      <ng-content select="[slot=action]"></ng-content>
      <div class="spacer right" *ngIf="!hasAction"></div>
    </header>
  `,
  styleUrls: ['./header.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class TabHeaderComponent {
  @Input() title = '';
  @Input({ transform: booleanAttribute }) back = false;
  @Input() href = '#';
  @Input() backRouterLink: string | any[] | null = null;
  @ContentChild('action', { static: true }) actionRef?: any;
  get hasAction() { return !!this.actionRef; }
}
```

## SCSS

```scss
@use '../tokens' as tokens;

:host { @include tokens.tab-tokens; display: block; }

header {
  display: grid;
  grid-template-columns: 40px 1fr 40px;
  align-items: center;
  gap: 12px;
  padding: 16px clamp(16px, 4vw, 56px) 8px;
  background: var(--c-bg);
  position: sticky; top: 0; z-index: 5;
}

.title {
  text-align: center;
  font-size: clamp(14px, 0.3vw + 13px, 16px);
  font-weight: 600;
  color: var(--c-text-strong);
  letter-spacing: -0.005em;
}

a.back {
  width: 40px; height: 40px;
  display: grid; place-items: center;
  color: var(--c-text);
  border-radius: 999px;
  text-decoration: none;
  &:hover { background: var(--c-elevated); color: var(--c-text-strong); }
}
.arrow { width: 18px; height: 18px; display: block; }
.spacer { width: 40px; }
::slotted([slot='action']) { justify-self: end; }

@media (min-width: 960px) {
  header {
    grid-template-columns: 1fr auto;
    padding: 32px clamp(24px, 4vw, 56px) 16px;
    background: transparent;
    position: static;
  }
  a.back { display: none; }
  .title {
    text-align: left;
    font-size: clamp(22px, 1vw + 18px, 28px);
    font-weight: 600;
    letter-spacing: -0.02em;
  }
  .spacer { display: none; }
  ::slotted([slot='action']) { justify-self: end; }
}
```

## Acceptance criteria

- [ ] Sticky on mobile, static on desktop.
- [ ] Back chevron renders as 18 px SVG `M15 6l-6 6 6 6` with 1.8 stroke.
- [ ] Title is centered on mobile, left-aligned and bigger (22–28 px) on desktop.
- [ ] `action` slot pins right at every breakpoint.
- [ ] No back chevron at ≥ 960 px (rail handles navigation).
- [ ] When `back` is absent on mobile, a 40 px spacer keeps the title centered.
