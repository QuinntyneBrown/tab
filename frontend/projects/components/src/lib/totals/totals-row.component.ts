import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import { AmountComponent } from '../amount/amount.component';

/**
 * Single totals row. See docs/components/tab-totals.md.
 */
@Component({
  selector: 'tab-totals-row',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  imports: [AmountComponent],
  template: `
    <div class="row" [class.final]="final">
      <span [class.strong]="labelStrong" [class.muted]="!labelStrong">
        {{ label }}
      </span>
      <tab-amount
        [value]="value"
        [size]="amountSize"
        [muted]="muted"
        [sign]="sign"></tab-amount>
    </div>
  `,
  styleUrl: './totals-row.component.scss',
})
export class TotalsRowComponent {
  @Input() label = '';
  @Input() value: number | string = 0;
  @Input() sign: string | null = null;
  @Input({ transform: booleanAttribute }) muted = false;
  @Input() amountSize: 'md' | 'xl' = 'md';
  @Input({ transform: booleanAttribute }) labelStrong = false;
  @Input({ transform: booleanAttribute }) final = false;
}
