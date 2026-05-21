import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewEncapsulation,
} from '@angular/core';

/**
 * Section header (uppercase title + optional trailing slot).
 * See docs/components/tab-section-head.md.
 */
@Component({
  selector: 'tab-section-head',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  templateUrl: './section-head.component.html',
  styleUrl: './section-head.component.scss',
})
export class SectionHeadComponent {
  @Input() title = '';
}
