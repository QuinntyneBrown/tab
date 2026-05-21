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

export interface TabSegment {
  key: string;
  label: string;
}

/**
 * Segmented control / radio strip. See docs/components/tab-segmented.md.
 * Mirrors docs/mocks/add.html:12-37 (inline styles).
 */
@Component({
  selector: 'tab-segmented',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  templateUrl: './segmented.component.html',
  styleUrl: './segmented.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SegmentedComponent),
      multi: true,
    },
  ],
})
export class SegmentedComponent implements ControlValueAccessor {
  @Input() segments: TabSegment[] = [];
  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();

  private cdr = inject(ChangeDetectorRef);
  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

  get cols(): string {
    return `repeat(${Math.max(this.segments.length, 1)}, 1fr)`;
  }

  select(key: string): void {
    if (this.value === key) return;
    this.value = key;
    this.valueChange.emit(key);
    this.onChange(key);
    this.onTouched();
  }

  onKey(e: KeyboardEvent): void {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const i = this.segments.findIndex(s => s.key === this.value);
    if (i < 0) return;
    const len = this.segments.length;
    const next = e.key === 'ArrowRight' ? (i + 1) % len : (i - 1 + len) % len;
    this.select(this.segments[next].key);
  }

  writeValue(v: string | null): void {
    this.value = v ?? '';
    this.cdr.markForCheck();
  }
  registerOnChange(fn: (v: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
}
