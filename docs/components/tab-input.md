# tab-input

**Selector:** `tab-input`
**File:** `projects/components/src/lib/input/input.component.ts`
**Mock reference:** `docs/mocks/assets/js/components.js:113-195`
**Used in:** login (email, passcode), add (subject, when, method, note)

## Purpose

Labeled form field. Pairs an uppercase eyebrow label with an elevated input
container; supports an optional `prefix` (used for the `$` glyph on money
fields), a small `hint` row, and any HTML input `type`. Switches to tabular
numerals automatically for `type="number"` or when `money` is set.

## Visual reference

```
EMAIL
┌───────────────────────────────┐
│ you@domain.com                │   field bg #3A3A3D, radius 12, padding 14×16
└───────────────────────────────┘
We'll text you a code if you forget.   ← hint, 12px muted
```

## API

### Inputs
| Name | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | Uppercase eyebrow above field |
| `type` | string (`'text' \| 'email' \| 'password' \| 'number' \| 'date' \| 'tel' \| ...`) | `'text'` | Forwarded to native `<input>` |
| `placeholder` | `string` | `''` | Forwarded to `<input>` |
| `value` | `string` | `''` | Initial value; supports two-way binding `[(value)]` |
| `prefix` | `string` | `null` | Inline prefix (e.g. `$`) rendered in `--font-num`, muted |
| `hint` | `string` | `null` | Helper text under the field |
| `money` | `boolean` | `false` | Forces tabular numerals + numeric font |
| `disabled` | `boolean` | `false` | Disables the native input |
| `autocomplete` | `string` | `null` | Forwarded to native input |
| `inputmode` | `string` | `null` | Forwarded to native input |

### Outputs
| Name | Type | Description |
|---|---|---|
| `valueChange` | `EventEmitter<string>` | Fires on input event |
| `(blur)`, `(focus)` | `EventEmitter<FocusEvent>` | Forwarded |

### Methods
- `focus()` — focuses the inner input.

### ControlValueAccessor
Implement `ControlValueAccessor` so the input plugs into Angular forms
(`formControlName`, `[(ngModel)]`).

## Visual specs

| Element | Spec |
|---|---|
| `label` | `font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--c-muted); font-weight: 600; margin-bottom: 8px; display: block` |
| `.field` | `display: flex; align-items: center; background: var(--c-elevated); border: 1px solid transparent; border-radius: 12px; padding: 14px 16px; transition: border-color/background var(--ease) 160ms` |
| `.field:focus-within` | `border-color: var(--c-focus); background: var(--c-surface)` |
| `.prefix` | `color: var(--c-muted); font-family: var(--font-num); font-weight: 500; margin-right: 8px` |
| `input` | `flex: 1; background: transparent; border: none; outline: none; color: var(--c-text-strong); font-family: var(--font-sans); font-size: 16px; min-width: 0` |
| `input::placeholder` | `color: var(--c-text-faint)` |
| `input[type=number]`, `:host([money]) input` | `font-family: var(--font-num); font-variant-numeric: tabular-nums; font-weight: 500` |
| `.hint` | `margin-top: 8px; font-size: 12px; color: var(--c-muted)` |

Host `display: block`.

## Angular template

```ts
@Component({
  selector: 'tab-input',
  standalone: true,
  imports: [],
  template: `
    <label part="label" *ngIf="label">{{ label }}</label>
    <div class="field">
      <span class="prefix" *ngIf="prefix">{{ prefix }}</span>
      <input
        #input
        [type]="type"
        [attr.inputmode]="inputmode"
        [attr.autocomplete]="autocomplete"
        [placeholder]="placeholder"
        [disabled]="disabled"
        [value]="value"
        (input)="onInput($event)"
        (blur)="onTouched(); blur.emit($event)"
        (focus)="focus.emit($event)" />
    </div>
    <div class="hint" *ngIf="hint">{{ hint }}</div>
  `,
  styleUrls: ['./input.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: TabInputComponent, multi: true }],
  host: {
    '[attr.type]': 'type',
    '[attr.money]': 'money ? "" : null',
  },
})
export class TabInputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() type = 'text';
  @Input() placeholder = '';
  @Input() value = '';
  @Input() prefix: string | null = null;
  @Input() hint: string | null = null;
  @Input() inputmode: string | null = null;
  @Input() autocomplete: string | null = null;
  @Input({ transform: booleanAttribute }) money = false;
  @Input({ transform: booleanAttribute }) disabled = false;
  @Output() valueChange = new EventEmitter<string>();
  @Output() blur = new EventEmitter<FocusEvent>();
  @Output() focus = new EventEmitter<FocusEvent>();
  @ViewChild('input') inputEl!: ElementRef<HTMLInputElement>;

  onChange: (v: string) => void = () => {};
  onTouched: () => void = () => {};

  onInput(e: Event) {
    this.value = (e.target as HTMLInputElement).value;
    this.valueChange.emit(this.value);
    this.onChange(this.value);
  }
  writeValue(v: string): void { this.value = v ?? ''; }
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState(d: boolean): void { this.disabled = d; }
  focusInput() { this.inputEl?.nativeElement.focus(); }
}
```

## SCSS

```scss
@use '../tokens' as tokens;

:host { @include tokens.tab-tokens; display: block; }

label {
  display: block;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--c-muted);
  font-weight: 600;
  margin-bottom: 8px;
}

.field {
  display: flex;
  align-items: center;
  background: var(--c-elevated);
  border: 1px solid transparent;
  border-radius: 12px;
  padding: 14px 16px;
  transition: border-color var(--ease) 160ms, background var(--ease) 160ms;
}
.field:focus-within {
  border-color: var(--c-focus);
  background: var(--c-surface);
}

.prefix {
  color: var(--c-muted);
  font-family: var(--font-num);
  font-weight: 500;
  margin-right: 8px;
}

input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--c-text-strong);
  font-family: var(--font-sans);
  font-size: 16px;
  min-width: 0;
}
input::placeholder { color: var(--c-text-faint); }

:host([type='number']) input,
:host([money]) input {
  font-family: var(--font-num);
  font-variant-numeric: tabular-nums;
  font-weight: 500;
}

.hint {
  margin-top: 8px;
  font-size: 12px;
  color: var(--c-muted);
}
```

## Accessibility

- Native `<input>` with associated `<label>` (use `for` / `id` or wrap label
  around field — the mocks render label as visible header above; either is fine
  if `aria-labelledby` is set).
- `hint` should be referenced via `aria-describedby` on the input.
- `:focus-within` provides clear visual focus on the wrapper without disturbing
  caret position.
- `inputmode="decimal"` should be set by callers for money fields.

## Acceptance criteria

- [ ] Label renders uppercase with `0.1em` tracking, 12 px, muted.
- [ ] Field bg `#3A3A3D` at rest; on `:focus-within` becomes `#313133` with `--c-focus` border.
- [ ] `prefix` shows in numeric font, muted, with 8 px right margin.
- [ ] `hint` renders below at 12 px muted.
- [ ] `[(value)]` two-way binding works; `formControlName` works.
- [ ] Number / money fields use `--font-num` with tabular numerals.
