import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewEncapsulation,
} from '@angular/core';

/**
 * Hairline separator. See docs/components/tab-divider.md.
 * Mirrors docs/mocks/assets/js/components.js:372-382.
 */
@Component({
  selector: 'tab-divider',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  templateUrl: './divider.component.html',
  styleUrl: './divider.component.scss',
  host: {
    'role': 'separator',
    'aria-orientation': 'horizontal',
    '[attr.strong]': 'strong ? "" : null',
  },
})
export class DividerComponent {
  @Input({ transform: booleanAttribute }) strong = false;
}
