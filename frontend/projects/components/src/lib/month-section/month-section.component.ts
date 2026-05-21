import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import { CardComponent } from '../card/card.component';

/**
 * Loans-by-month wrapper. See docs/components/tab-month-section.md.
 * Mirrors docs/mocks/loans.html month groupings.
 */
@Component({
  selector: 'tab-month-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  imports: [CardComponent],
  templateUrl: './month-section.component.html',
  styleUrl: './month-section.component.scss',
})
export class MonthSectionComponent {
  @Input() monthLabel = '';
  @Input() total = '';
}
