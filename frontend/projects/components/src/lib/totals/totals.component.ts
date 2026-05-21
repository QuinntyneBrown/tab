import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';

/**
 * Statement totals block wrapper. See docs/components/tab-totals.md.
 */
@Component({
  selector: 'tab-totals',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  template: `<slot></slot>`,
  styleUrl: './totals.component.scss',
})
export class TotalsComponent {}
