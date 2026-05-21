import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { AmountComponent } from '../amount/amount.component';
import { BadgeComponent } from '../badge/badge.component';
import { ButtonComponent } from '../button/button.component';
import { CardComponent } from '../card/card.component';

export interface TabBillCardBadge {
  text: string;
  variant?: 'default' | 'strong' | 'quiet';
  dot?: boolean;
}

/**
 * Recurring-bill summary card. See docs/components/tab-bill-card.md.
 * Mirrors docs/mocks/bills.html:64-159.
 */
@Component({
  selector: 'tab-bill-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  imports: [AmountComponent, BadgeComponent, ButtonComponent, CardComponent],
  templateUrl: './bill-card.component.html',
  styleUrl: './bill-card.component.scss',
})
export class BillCardComponent {
  @Input() name = '';
  @Input() meta = '';
  @Input() badge: TabBillCardBadge = { text: '' };
  @Input() primaryKey = 'Expected';
  @Input() primaryValue: number | string = 0;
  @Input({ transform: booleanAttribute }) primaryMuted = false;
  @Input() splitKey = "Their half";
  @Input() splitValue: number | string = 0;
  @Input() primaryAction = 'Log this month';
  @Input() secondaryAction = 'Edit';

  @Output() primaryClick = new EventEmitter<void>();
  @Output() secondaryClick = new EventEmitter<void>();
}
