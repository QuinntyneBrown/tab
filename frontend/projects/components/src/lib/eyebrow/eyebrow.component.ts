import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewEncapsulation,
} from '@angular/core';

/**
 * Uppercase muted label. See docs/components/tab-eyebrow.md.
 */
@Component({
  selector: 'tab-eyebrow',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  templateUrl: './eyebrow.component.html',
  styleUrl: './eyebrow.component.scss',
  host: {
    '[attr.size]': 'size === "sm" ? null : size',
    '[attr.tracking]': 'tracking === "loose" ? null : tracking',
  },
})
export class EyebrowComponent {
  @Input() size: 'xs' | 'sm' = 'sm';
  @Input() tracking: 'snug' | 'loose' | 'extra' = 'loose';
}
