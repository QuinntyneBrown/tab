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
  template: `
    <tab-card>
      <div class="bill">
        <div class="bill-top">
          <div>
            <div class="bill-name">{{ name }}</div>
            <div class="bill-meta">{{ meta }}</div>
          </div>
          <tab-badge
            [variant]="badge.variant ?? 'default'"
            [dot]="!!badge.dot">{{ badge.text }}</tab-badge>
        </div>

        <div class="bill-grid">
          <div class="cell">
            <div class="k">{{ primaryKey }}</div>
            <div class="v">
              <tab-amount
                [value]="primaryValue"
                size="md"
                [muted]="primaryMuted"></tab-amount>
            </div>
          </div>
          <div class="cell">
            <div class="k">{{ splitKey }}</div>
            <div class="v">
              <tab-amount [value]="splitValue" size="md"></tab-amount>
            </div>
          </div>
        </div>

        <div class="bill-actions">
          <tab-button full size="sm" (click)="primaryClick.emit()">
            {{ primaryAction }}
          </tab-button>
          <tab-button full size="sm" variant="ghost" (click)="secondaryClick.emit()">
            {{ secondaryAction }}
          </tab-button>
        </div>
      </div>
    </tab-card>
  `,
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
