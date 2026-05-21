# tab-icon

**Selector:** `tab-icon`
**File:** `projects/components/src/lib/icon/icon.component.ts`
**Mock reference:** SVG paths inlined in `components.js` (back-arrow at `:442`, nav icons at `:558-566`)
**Used in:** `tab-nav`, `tab-header` back chevron, anywhere we need a stroke icon

## Purpose

Single SVG icon primitive — all icons in the app are stroke-only, 24×24 viewBox,
1.6 stroke-width, round caps/joins. Keeps icon authoring in one place rather
than re-declaring `<svg>` in every consumer.

## Visual reference

```
back-chevron (18px in header):    home (22px in nav):
       ⟨                            ⌂
```

All icons share: `stroke: currentColor; fill: none; stroke-linecap: round; stroke-linejoin: round`.

## API

### Inputs
| Name | Type | Default | Description |
|---|---|---|---|
| `name` | `IconName` | required | Icon key — see registry |
| `size` | `number` | `22` | Square pixel size |
| `strokeWidth` | `number` | `1.6` | Override stroke width (header back arrow uses `1.8`) |

### Type
```ts
type IconName =
  | 'home' | 'loans' | 'bills' | 'settings'
  | 'back' | 'plus' | 'check' | 'share' | 'edit';
```

### Registry (initial set — extend as new icons appear)

```ts
const ICONS: Record<IconName, string> = {
  home:     '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
  loans:    '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/>',
  bills:    '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z"/><path d="M9 8h6M9 12h6"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.11-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06A2 2 0 1 1 4.13 16.92l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.65 8.85a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H9a1.7 1.7 0 0 0 1.03-1.56V3a2 2 0 1 1 4 0v.09c0 .67.4 1.27 1.03 1.56a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V9c.29.63.89 1.03 1.56 1.03H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.56 1.03z"/>',
  back:     '<path d="M15 6l-6 6 6 6"/>',
  plus:     '<path d="M12 5v14M5 12h14"/>',
  check:    '<path d="M5 12l5 5 9-11"/>',
  share:    '<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M16 6l-4-4-4 4"/><path d="M12 2v14"/>',
  edit:     '<path d="M4 20h4l11-11-4-4L4 16v4z"/>',
};
```

Paths for `home`, `loans`, `bills`, `settings`, `back` are **literal copies**
from `components.js`. Do not rewrite them.

## Visual specs

Host `display: inline-flex; line-height: 0`.
SVG inherits color from `currentColor`.

## Angular template

```ts
@Component({
  selector: 'tab-icon',
  standalone: true,
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24"
         fill="none"
         [attr.stroke-width]="strokeWidth"
         stroke="currentColor"
         stroke-linecap="round" stroke-linejoin="round"
         aria-hidden="true"
         [innerHTML]="path">
    </svg>
  `,
  styleUrls: ['./icon.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class TabIconComponent {
  @Input() name!: IconName;
  @Input() size = 22;
  @Input() strokeWidth = 1.6;
  constructor(private s: DomSanitizer) {}
  get path() {
    return this.s.bypassSecurityTrustHtml(ICONS[this.name] ?? '');
  }
}
```

## SCSS

```scss
@use '../tokens' as tokens;

:host {
  @include tokens.tab-tokens;
  display: inline-flex;
  line-height: 0;
  color: inherit;
}
svg { display: block; }
```

## Acceptance criteria

- [ ] Default size 22 px, stroke 1.6, round caps/joins, no fill, color via `currentColor`.
- [ ] All paths byte-identical to the mocks' source.
- [ ] `aria-hidden="true"` — icons accompanied by text labels are decorative.
- [ ] Header back-chevron usage sets `[size]="18"` and `[strokeWidth]="1.8"`.
