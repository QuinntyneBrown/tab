import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewEncapsulation,
} from '@angular/core';

/**
 * Statement ledger table. See docs/components/tab-ledger.md.
 * Mirrors docs/mocks/statement.html:54-80, 132-172.
 */
@Component({
  selector: 'tab-ledger',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  template: `
    <div class="ledger-head">
      <span>{{ itemHead }}</span>
      <span class="num">{{ totalHead }}</span>
      <span class="num">{{ shareHead }}</span>
    </div>
    <slot></slot>
  `,
  styleUrl: './ledger.component.scss',
})
export class LedgerComponent {
  @Input() itemHead = 'Item';
  @Input() totalHead = 'Total';
  @Input() shareHead = 'Your share';
}
