# tab-empty

**Selector:** `tab-empty`
**File:** `projects/components/src/lib/empty/empty.component.ts`
**Mock reference:** `docs/mocks/assets/js/components.js:580-618`
**Used in:** any list/grid (loans, bills, statement) when there are no records yet — not present in current mock HTML pages but defined as a primitive

## Purpose

Empty-state placard: a 56 px round elevated glyph tile, a strong title, and
muted body copy. Used whenever a list collection is empty — keeps the void
graceful rather than alarming.

## Visual reference

```
       ┌────────┐
       │   ·    │   ← glyph circle, 56px, --c-elevated, hairline-strong
       └────────┘
       No loans yet         ← title slot, 17px strong 600
       When you lend cash, …  ← default slot, muted body
```

## API

### Content projection (named slots)
- `glyph` — content inside the round tile (defaults to "·"); typically an
  emoji or a `<tab-icon>` element
- `title` — bolded headline
- default — body / call-to-action paragraph

## Visual specs

`.e` (root):
- `text-align: center; padding: 48px 20px; color: var(--c-muted)`

`.glyph`:
- `width: 56px; height: 56px`
- `border-radius: 50%; background: var(--c-elevated)`
- `margin: 0 auto 16px`
- `display: grid; place-items: center`
- `color: var(--c-text-strong); font-size: 22px`
- `border: 1px solid var(--c-hairline-strong)`

`[slot=title]`:
- `display: block; color: var(--c-text-strong); font-weight: 600; font-size: 17px; margin-bottom: 6px`

Host `display: block`.

## Angular template

```ts
@Component({
  selector: 'tab-empty',
  standalone: true,
  template: `
    <div class="e">
      <div class="glyph">
        <ng-content select="[slot=glyph]">·</ng-content>
      </div>
      <ng-content select="[slot=title]"></ng-content>
      <ng-content></ng-content>
    </div>
  `,
  styleUrls: ['./empty.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class TabEmptyComponent {}
```

## SCSS

```scss
@use '../tokens' as tokens;

:host { @include tokens.tab-tokens; display: block; }

.e {
  text-align: center;
  padding: 48px 20px;
  color: var(--c-muted);
}

.glyph {
  width: 56px; height: 56px;
  border-radius: 50%;
  background: var(--c-elevated);
  margin: 0 auto 16px;
  display: grid; place-items: center;
  color: var(--c-text-strong);
  font-size: 22px;
  border: 1px solid var(--c-hairline-strong);
}

::slotted([slot='title']) {
  display: block;
  color: var(--c-text-strong);
  font-weight: 600;
  font-size: 17px;
  margin-bottom: 6px;
}
```

## Acceptance criteria

- [ ] 56 px circular glyph tile sits centered with 16 px below.
- [ ] Title is 17 px strong 600; body muted 14 px (inherits).
- [ ] Default glyph content is "·" when no `glyph` slot is provided.
- [ ] 48 px top/bottom padding around the placard.
