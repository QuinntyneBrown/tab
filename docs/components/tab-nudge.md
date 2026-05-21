# tab-nudge

**Selector:** `tab-nudge`
**File:** `projects/components/src/lib/nudge/nudge.component.ts`
**Mock reference:** `docs/mocks/dashboard.html:48-58, 96-100`
**Used in:** dashboard heads-up message

## Purpose

Dashed-border informational card. Calls attention without alarm — used on the
dashboard to surface upcoming bill commitments ("Hydro is due in 4 days…").
Distinct from `<tab-card>` by its dashed border and slightly smaller radius.

## Visual reference

```
┌╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴┐
│ Heads up. Hydro is due in 4 days.    │
│ Your share will be roughly $84.00 —  │
│ Ray's half will post automatically … │
└╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴┘
1 px dashed --c-hairline-strong on --c-surface, radius 14
```

## API

### Inputs
| Name | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | `null` | Optional bold lede ("Heads up.") |

### Content projection
- Default slot: body text (may include inline `<span class="strong tabular">$XX.XX</span>` fragments)

## Visual specs

Host:
- `display: block`
- `margin-top: var(--s-5)` (when used inline; otherwise consumer controls margin)
- `padding: var(--s-4) var(--s-5)`
- `background: var(--c-surface)`
- `border: 1px dashed var(--c-hairline-strong)`
- `border-radius: 14px`
- `font-size: 14px`
- `color: var(--c-text)`
- `line-height: 1.5`

`.label` (rendered inside slot when `label` input set):
- `color: var(--c-text-strong); font-weight: 600`
- Inline; default body continues after it with a single space.

## Angular template

```ts
@Component({
  selector: 'tab-nudge',
  standalone: true,
  template: `
    <span class="label" *ngIf="label">{{ label }}</span>
    <ng-content></ng-content>
  `,
  styleUrls: ['./nudge.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class TabNudgeComponent {
  @Input() label: string | null = null;
}
```

## SCSS

```scss
@use '../tokens' as tokens;

:host {
  @include tokens.tab-tokens;
  display: block;
  padding: var(--s-4) var(--s-5);
  background: var(--c-surface);
  border: 1px dashed var(--c-hairline-strong);
  border-radius: 14px;
  font-size: 14px;
  color: var(--c-text);
  line-height: 1.5;
}

.label {
  color: var(--c-text-strong);
  font-weight: 600;
  margin-right: 0.25em;
}
```

## Acceptance criteria

- [ ] 1 px **dashed** (not solid) border, color `--c-hairline-strong`.
- [ ] `--c-surface` fill, radius `14 px`, padding `16 / 20 px`.
- [ ] Lede label renders strong-600 inline, separated by a single space from body.
- [ ] Inline strong/tabular fragments inside the slot still render correctly (no shadow-DOM isolation, so global utilities like `.tabular`, `.strong` work via `Emulated` encapsulation).
