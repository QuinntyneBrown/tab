import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  forwardRef,
  inject,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ButtonComponent } from '../button/button.component';

/**
 * Hero amount entry on the add screen. See docs/components/tab-amount-input.md.
 * Mirrors docs/mocks/add.html:39-67 (inline styles).
 */
@Component({
  selector: 'tab-amount-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  imports: [ButtonComponent],
  template: `
    <div class="amount-stage">
      <div class="label">{{ label }}</div>
      <input
        class="amount-input"
        [attr.inputmode]="inputmode"
        [placeholder]="placeholder"
        [value]="value"
        (input)="onInput($event)" />
      <div class="chips">
        @for (c of chips; track c) {
          <tab-button variant="ghost" size="sm" (click)="applyChip(c)">
            {{ currency }}{{ c }}
          </tab-button>
        }
      </div>
    </div>
  `,
  styleUrl: './amount-input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AmountInputComponent),
      multi: true,
    },
  ],
})
export class AmountInputComponent implements ControlValueAccessor {
  @Input() label = 'Amount';
  @Input() value = '';
  @Input() placeholder = '$0.00';
  @Input() chips: number[] = [20, 50, 100, 200];
  @Input() currency = '$';
  @Input() inputmode = 'decimal';

  @Output() valueChange = new EventEmitter<string>();
  @Output() chipApplied = new EventEmitter<number>();

  private cdr = inject(ChangeDetectorRef);
  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

  onInput(e: Event): void {
    this.value = (e.target as HTMLInputElement).value;
    this.emit();
  }

  applyChip(n: number): void {
    this.value = `${this.currency}${n.toFixed(2)}`;
    this.chipApplied.emit(n);
    this.emit();
    this.cdr.markForCheck();
  }

  private emit(): void {
    this.valueChange.emit(this.value);
    this.onChange(this.value);
    this.onTouched();
  }

  writeValue(v: string | null): void {
    this.value = v ?? '';
    this.cdr.markForCheck();
  }
  registerOnChange(fn: (v: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
}
