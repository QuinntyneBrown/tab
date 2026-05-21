# tab-amount-input

**Selector:** `tab-amount-input`
**File:** `projects/components/src/lib/amount-input/amount-input.component.ts`
**Mock reference:** `docs/mocks/add.html:39-67, 82-91`
**Used in:** add (hero amount entry stage)

## Purpose

The giant centered money entry on the add screen. Uppercase muted label,
borderless 64 px tabular numeric input, and a row of ghost "chip" buttons
($20 / $50 / $100 / $200) that fill the field on click.

## Visual reference

```
                    AMOUNT LENT                       ← label
                     $120.00                          ← borderless input, 64px num font
              [ $20 ] [ $50 ] [ $100 ] [ $200 ]       ← ghost-button chips
```

## API

### Inputs
| Name | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | `'Amount'` | Uppercase eyebrow above field |
| `value` | `string` | `''` | Current value as a string (preserves the leading `$` typed in mocks); two-way bindable |
| `placeholder` | `string` | `'$0.00'` | Empty-state placeholder |
| `chips` | `number[]` | `[20, 50, 100, 200]` | Quick-fill values |
| `currency` | `string` | `'$'` | Prefix used when applying a chip |
| `inputmode` | `string` | `'decimal'` | Forwarded to input |

### Outputs
| Name | Type | Description |
|---|---|---|
| `valueChange` | `EventEmitter<string>` | Emits raw input string |
| `chipApplied` | `EventEmitter<number>` | Emits the numeric chip value selected |

## Visual specs

Container `.amount-stage`:
- `text-align: center`
- `padding: var(--s-7) 0 var(--s-5)`

`.label`:
- `color: var(--c-muted)`
- `font-size: 12px`
- `text-transform: uppercase`
- `letter-spacing: 0.14em`
- `font-weight: 600`
- `margin-bottom: var(--s-3)`

`.amount-input` (native `<input>`):
- `width: 100%`
- `background: transparent; border: 0; outline: 0`
- `color: var(--c-text-strong)`
- `font-family: var(--font-num)`
- `font-variant-numeric: tabular-nums`
- `font-weight: 500`
- `font-size: 64px`
- `letter-spacing: -0.03em`
- `text-align: center`
- `caret-color: var(--c-text)`
- `::placeholder { color: var(--c-text-faint) }`

`.chips` (row):
- `display: flex; gap: var(--s-2); flex-wrap: wrap; justify-content: center`
- `margin-top: var(--s-3)`

Each chip = `<tab-button variant="ghost" size="sm">` with `$N` label.

## Angular template

```ts
@Component({
  selector: 'tab-amount-input',
  standalone: true,
  imports: [TabButtonComponent, NgFor],
  template: `
    <div class="amount-stage">
      <div class="label">{{ label }}</div>
      <input
        class="amount-input"
        [inputmode]="inputmode"
        [placeholder]="placeholder"
        [value]="value"
        (input)="onInput($event)" />
      <div class="chips">
        <tab-button *ngFor="let c of chips"
                    variant="ghost" size="sm"
                    (click)="applyChip(c)">
          {{ currency }}{{ c }}
        </tab-button>
      </div>
    </div>
  `,
  styleUrls: ['./amount-input.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: TabAmountInputComponent, multi: true }],
})
export class TabAmountInputComponent implements ControlValueAccessor {
  @Input() label = 'Amount';
  @Input() value = '';
  @Input() placeholder = '$0.00';
  @Input() chips: number[] = [20, 50, 100, 200];
  @Input() currency = '$';
  @Input() inputmode = 'decimal';
  @Output() valueChange = new EventEmitter<string>();
  @Output() chipApplied = new EventEmitter<number>();

  onChange: (v: string) => void = () => {};
  onTouched: () => void = () => {};

  onInput(e: Event) {
    this.value = (e.target as HTMLInputElement).value;
    this.emit();
  }
  applyChip(n: number) {
    this.value = `${this.currency}${n.toFixed(2)}`;
    this.chipApplied.emit(n);
    this.emit();
  }
  private emit() {
    this.valueChange.emit(this.value);
    this.onChange(this.value);
    this.onTouched();
  }
  writeValue(v: string) { this.value = v ?? ''; }
  registerOnChange(fn: any) { this.onChange = fn; }
  registerOnTouched(fn: any) { this.onTouched = fn; }
}
```

## SCSS

```scss
@use '../tokens' as tokens;

:host { @include tokens.tab-tokens; display: block; }

.amount-stage {
  text-align: center;
  padding: var(--s-7) 0 var(--s-5);
}

.label {
  color: var(--c-muted);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-weight: 600;
  margin-bottom: var(--s-3);
}

.amount-input {
  width: 100%;
  background: transparent;
  border: 0;
  outline: 0;
  color: var(--c-text-strong);
  font-family: var(--font-num);
  font-variant-numeric: tabular-nums;
  font-weight: 500;
  font-size: 64px;
  letter-spacing: -0.03em;
  text-align: center;
  caret-color: var(--c-text);

  &::placeholder { color: var(--c-text-faint); }
  &:focus-visible {
    outline: 2px solid var(--c-focus);
    outline-offset: 4px;
    border-radius: var(--r-sm);
  }
}

.chips {
  display: flex;
  gap: var(--s-2);
  flex-wrap: wrap;
  justify-content: center;
  margin-top: var(--s-3);
}
```

## Accessibility

- The native input handles AT properly; label associated via `aria-labelledby`
  pointing to the `.label` div, or use a visually-displayed `<label>` element
  with `for` pointing to the input id.
- Chips are `<button>` elements (via `<tab-button>`); clicking sets value.

## Acceptance criteria

- [ ] 64 px num-font input, transparent bg, centered text.
- [ ] Placeholder is `$0.00` in `--c-text-faint`.
- [ ] Chip row centered with 8 px gap, wraps on narrow widths.
- [ ] Tapping a chip replaces value with `$N.00`.
- [ ] Tab order: input → each chip in order.
