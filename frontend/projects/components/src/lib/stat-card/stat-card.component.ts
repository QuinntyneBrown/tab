import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import { AmountComponent } from '../amount/amount.component';

/**
 * Summary-strip stat tile (loans page).
 * See docs/components/tab-stat-card.md.
 */
@Component({
  selector: 'tab-stat-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  imports: [AmountComponent],
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.scss',
})
export class StatCardComponent {
  @Input() label = '';
  @Input() value: number | string = 0;
  @Input() amountSize: 'md' | 'xl' | '2xl' = 'xl';
  @Input({ transform: booleanAttribute }) muted = false;
  @Input({ transform: booleanAttribute }) hero = false;
}
