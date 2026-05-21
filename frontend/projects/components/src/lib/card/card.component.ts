import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewEncapsulation,
} from '@angular/core';

/**
 * Surface container. See docs/components/tab-card.md.
 * Mirrors docs/mocks/assets/js/components.js:88-111.
 */
@Component({
  selector: 'tab-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  host: {
    '[attr.padding]': 'padding === "md" ? null : padding',
    '[attr.flat]': 'flat ? "" : null',
    '[attr.hero]': 'hero ? "" : null',
  },
})
export class CardComponent {
  @Input() padding: 'sm' | 'md' | 'lg' = 'md';
  @Input({ transform: booleanAttribute }) flat = false;
  @Input({ transform: booleanAttribute }) hero = false;
}
