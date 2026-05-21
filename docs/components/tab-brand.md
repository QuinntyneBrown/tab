# tab-brand

**Selector:** `tab-brand`
**File:** `projects/components/src/lib/brand/brand.component.ts`
**Mock references:**
- Login wordmark: `docs/mocks/login.html:19-27, 47`
- Dashboard topbar mark: `docs/mocks/dashboard.html:18, 70`
- Statement head: `docs/mocks/statement.html:34-41, 115`
- Nav rail brand: `docs/mocks/assets/js/components.js:526-537, 569`
- Utility `.brand` in `base.css:162-175`

**Used in:** login (hero), dashboard topbar, statement header, nav rail

## Purpose

The "tab." wordmark. It appears in four sizes across the app — login hero
(44 px), nav rail (22 px), dashboard topbar (~18–22 px), statement header
(22 px). The dot is muted and tracks tightly to the word.

## Visual reference

```
tab.        ← strong text + muted dot
^^^---
font-num, 700 weight, letter-spacing -0.03 to -0.04em
```

## API

### Inputs
| Name | Type | Default | Description |
|---|---|---|---|
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | `sm`=18 px, `md`=22 px, `lg`=32 px, `xl`=44 px |
| `dotStyle` | `'inline' \| 'pill'` | `'inline'` | Inline period (default) vs. raised 6 px filled dot (base.css `.brand .dot` variant) |

## Visual specs

Host:
- `font-family: var(--font-num)`
- `font-weight: 700`
- `letter-spacing: -0.04em` (default), `-0.03em` for `md`/`lg`/`xl`
- `color: var(--c-text-strong)`
- `display: inline-block`

Sizes (host font-size):
| Size | Value | Tracking |
|---|---|---|
| `sm` | `18px` | `-0.03em` |
| `md` | `22px` | `-0.03em` |
| `lg` | `32px` | `-0.04em` |
| `xl` | `44px` | `-0.04em` |

`.dot` (inline, period glyph):
- `color: var(--c-muted)`

`.dot[dotStyle=pill]` (raised 6 px from `base.css:.brand .dot`):
- `display: inline-block`
- `width: 6px; height: 6px`
- `background: var(--c-text-strong)`
- `border-radius: 50%`
- `vertical-align: 0.1em`
- `margin-left: 1px`

## Angular template

```ts
@Component({
  selector: 'tab-brand',
  standalone: true,
  template: `
    <span class="word">tab</span><!--
    --><span class="dot" *ngIf="dotStyle === 'inline'">.</span><!--
    --><span class="dot pill" *ngIf="dotStyle === 'pill'" aria-hidden="true"></span>
  `,
  styleUrls: ['./brand.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    'role': 'img',
    'aria-label': 'tab',
    '[attr.size]': 'size === "md" ? null : size',
  },
})
export class TabBrandComponent {
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() dotStyle: 'inline' | 'pill' = 'inline';
}
```

## SCSS

```scss
@use '../tokens' as tokens;

:host {
  @include tokens.tab-tokens;
  display: inline-block;
  font-family: var(--font-num);
  font-weight: 700;
  color: var(--c-text-strong);
  font-size: 22px;
  letter-spacing: -0.03em;
  line-height: 1;
}

:host([size='sm']) { font-size: 18px; letter-spacing: -0.03em; }
:host([size='lg']) { font-size: 32px; letter-spacing: -0.04em; }
:host([size='xl']) { font-size: 44px; letter-spacing: -0.04em; }

.dot { color: var(--c-muted); }
.dot.pill {
  display: inline-block;
  width: 6px; height: 6px;
  background: var(--c-text-strong);
  border-radius: 50%;
  vertical-align: 0.1em;
  margin-left: 1px;
}
```

## Acceptance criteria

- [ ] Wordmark uses `var(--font-num)` at weight 700.
- [ ] Inline-dot variant matches login / dashboard / statement (`tab` + muted "`.`").
- [ ] Pill-dot variant (when chosen) matches `base.css .brand .dot` exactly.
- [ ] Four discrete sizes (18 / 22 / 32 / 44 px).
- [ ] `aria-label="tab"` exposed on host (decorative dot hidden from AT).
