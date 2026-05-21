import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewEncapsulation,
} from '@angular/core';

/**
 * Status pill. See docs/components/tab-badge.md.
 * Mirrors docs/mocks/assets/js/components.js:291-319.
 */
@Component({
  selector: 'tab-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  templateUrl: './badge.component.html',
  styleUrl: './badge.component.scss',
  host: {
    '[attr.strong]': 'variant === "strong" ? "" : null',
    '[attr.quiet]':  'variant === "quiet"  ? "" : null',
  },
})
export class BadgeComponent {
  @Input() variant: 'default' | 'strong' | 'quiet' = 'default';
  @Input({ transform: booleanAttribute }) dot = false;
}
