import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewEncapsulation,
} from '@angular/core';

/**
 * Money value with tabular numerals. See docs/components/tab-amount.md.
 * Mirrors docs/mocks/assets/js/components.js:197-258.
 */
@Component({
  selector: 'tab-amount',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  templateUrl: './amount.component.html',
  styleUrl: './amount.component.scss',
  host: {
    '[attr.size]': 'size === "md" ? null : size',
    '[attr.muted]': 'muted ? "" : null',
  },
})
export class AmountComponent {
  @Input() value: number | string = 0;
  @Input() size: 'sm' | 'md' | 'xl' | '2xl' | 'hero' = 'md';
  @Input() currency = '$';
  @Input() sign: string | null = null;
  @Input({ transform: booleanAttribute }) muted = false;

  private get abs(): number {
    const n = typeof this.value === 'string' ? parseFloat(this.value) : this.value;
    return Math.abs(Number.isFinite(n) ? n : 0);
  }

  get whole(): string {
    return Math.floor(this.abs).toLocaleString('en-US');
  }

  get cents(): string {
    const v = this.abs;
    return (v - Math.floor(v)).toFixed(2).slice(2);
  }
}
