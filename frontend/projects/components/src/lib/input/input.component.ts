import {
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  inject,
  Input,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Labeled form field. See docs/components/tab-input.md.
 * Mirrors docs/mocks/assets/js/components.js:113-195.
 */
@Component({
  selector: 'tab-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
  host: {
    '[attr.type]': 'type',
    '[attr.money]': 'money ? "" : null',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
})
export class InputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() type = 'text';
  @Input() placeholder = '';
  @Input() value = '';
  @Input() prefix: string | null = null;
  @Input() hint: string | null = null;
  @Input() name: string | null = null;
  @Input() inputmode: string | null = null;
  @Input() autocomplete: string | null = null;
  @Input({ transform: booleanAttribute }) money = false;
  @Input({ transform: booleanAttribute }) disabled = false;

  @Output() valueChange = new EventEmitter<string>();
  @Output('blur') blurOut = new EventEmitter<FocusEvent>();
  @Output('focus') focusOut = new EventEmitter<FocusEvent>();

  @ViewChild('input', { static: false }) inputEl?: ElementRef<HTMLInputElement>;

  private cdr = inject(ChangeDetectorRef);
  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

  onInput(e: Event): void {
    const v = (e.target as HTMLInputElement).value;
    this.value = v;
    this.valueChange.emit(v);
    this.onChange(v);
  }

  onBlurInternal(e: FocusEvent): void {
    this.onTouched();
    this.blurOut.emit(e);
  }

  writeValue(v: string | null): void {
    this.value = v ?? '';
    this.cdr.markForCheck();
  }
  registerOnChange(fn: (v: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(d: boolean): void {
    this.disabled = d;
    this.cdr.markForCheck();
  }

  focus(): void { this.inputEl?.nativeElement.focus(); }
}
