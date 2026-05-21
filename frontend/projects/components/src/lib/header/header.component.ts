import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewEncapsulation,
} from '@angular/core';

/**
 * Page top bar. See docs/components/tab-header.md.
 * Mirrors docs/mocks/assets/js/components.js:384-460.
 */
@Component({
  selector: 'tab-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  @Input() title = '';
  @Input({ transform: booleanAttribute }) back = false;
  @Input() href = '#';
  @Input() backLabel = 'Back';
}
