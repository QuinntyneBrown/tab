# tab-segmented

**Selector:** `tab-segmented`
**File:** `projects/components/src/lib/segmented/segmented.component.ts`
**Mock reference:** `docs/mocks/add.html:12-37, 76-80`
**Used in:** add (entry type switcher: Loan / Bill payment / Payment in)

## Purpose

Segmented control / tab strip used at the top of the add-entry sheet. Pill
shape with internal padding, selected segment swaps to `--c-text-strong`
background with `--c-bg` text. Acts as a radio group.

## Visual reference

```
┌──────────────────────────────────────────┐
│( Loan ) ( Bill payment ) ( Payment in ) │   pill bg --c-elevated, 4px inner padding
└──────────────────────────────────────────┘
selected: bg #E6E6EA, color #2E2E30
unselected: bg transparent, color --c-muted, 600 weight
```

## API

### Inputs
| Name | Type | Default | Description |
|---|---|---|---|
| `segments` | `Array<{ key: string; label: string }>` | required | Options |
| `value` | `string` | first segment's key | Currently selected key (two-way bindable as `[(value)]`) |

### Outputs
| Name | Type | Description |
|---|---|---|
| `valueChange` | `EventEmitter<string>` | Emits new key when user selects |

### ControlValueAccessor
Implement so it integrates with reactive forms (radio semantics).

## Visual specs

`.seg` (container):
- `display: grid; grid-template-columns: repeat(N, 1fr)` where N = `segments.length`
- `background: var(--c-elevated)`
- `border-radius: var(--r-pill)` (999 px)
- `padding: 4px`
- `gap: 2px`
- `margin-bottom: var(--s-6)`

`button` (each segment):
- `font: inherit; font-family: var(--font-sans)`
- `font-weight: 600`
- `font-size: 13px`
- `background: transparent; border: 0`
- `color: var(--c-muted)`
- `padding: 10px 14px`
- `border-radius: var(--r-pill)`
- `cursor: pointer`
- `transition: background var(--ease) 180ms, color var(--ease) 180ms`

`button[aria-selected="true"]`:
- `background: var(--c-text-strong)` (#E6E6EA)
- `color: var(--c-bg)` (#2E2E30)

## Angular template

```ts
@Component({
  selector: 'tab-segmented',
  standalone: true,
  imports: [NgFor],
  template: `
    <div class="seg" role="tablist"
         [style.grid-template-columns]="'repeat(' + segments.length + ', 1fr)'">
      <button *ngFor="let s of segments"
              type="button"
              role="tab"
              [attr.aria-selected]="s.key === value"
              [attr.tabindex]="s.key === value ? 0 : -1"
              (click)="select(s.key)"
              (keydown)="onKey($event, s.key)">
        {{ s.label }}
      </button>
    </div>
  `,
  styleUrls: ['./segmented.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: TabSegmentedComponent, multi: true }],
})
export class TabSegmentedComponent implements ControlValueAccessor {
  @Input() segments: { key: string; label: string }[] = [];
  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();

  onChange: (v: string) => void = () => {};
  onTouched: () => void = () => {};
  writeValue(v: string) { this.value = v ?? ''; }
  registerOnChange(fn: any) { this.onChange = fn; }
  registerOnTouched(fn: any) { this.onTouched = fn; }

  select(key: string) {
    if (this.value === key) return;
    this.value = key;
    this.valueChange.emit(key);
    this.onChange(key);
    this.onTouched();
  }

  onKey(e: KeyboardEvent, key: string) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    const i = this.segments.findIndex(s => s.key === this.value);
    const next = e.key === 'ArrowRight'
      ? (i + 1) % this.segments.length
      : (i - 1 + this.segments.length) % this.segments.length;
    this.select(this.segments[next].key);
  }
}
```

## SCSS

```scss
@use '../tokens' as tokens;

:host { @include tokens.tab-tokens; display: block; }

.seg {
  display: grid;
  background: var(--c-elevated);
  border-radius: var(--r-pill);
  padding: 4px;
  gap: 2px;
}

button {
  font: inherit;
  font-family: var(--font-sans);
  font-weight: 600;
  font-size: 13px;
  background: transparent;
  border: 0;
  color: var(--c-muted);
  padding: 10px 14px;
  border-radius: var(--r-pill);
  cursor: pointer;
  transition: background var(--ease) 180ms, color var(--ease) 180ms;

  &[aria-selected='true'] {
    background: var(--c-text-strong);
    color: var(--c-bg);
  }
  &:focus-visible {
    outline: 2px solid var(--c-focus);
    outline-offset: 2px;
  }
}
```

## Accessibility

- `role="tablist"` on container, `role="tab"` on each button, `aria-selected` toggles.
- Arrow-key navigation moves selection; only the active tab is in tab order
  (others `tabindex="-1"`).

## Acceptance criteria

- [ ] N-column grid auto-derived from segments length.
- [ ] Pill radius, 4 px container padding, 2 px gap between buttons.
- [ ] Selected segment matches mock exactly (`#E6E6EA` bg / `#2E2E30` text).
- [ ] Unselected: muted 600 weight, transparent.
- [ ] Arrow-keys navigate; selection emits `valueChange` and writes value via CVA.
