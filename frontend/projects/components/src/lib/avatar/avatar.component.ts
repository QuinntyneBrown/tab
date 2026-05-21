import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewEncapsulation,
} from '@angular/core';

/**
 * Initials avatar. See docs/components/tab-avatar.md.
 * Mirrors docs/mocks/assets/js/components.js:260-289.
 */
@Component({
  selector: 'tab-avatar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss',
  host: {
    'role': 'img',
    '[attr.aria-label]': 'name',
    '[attr.size]': 'size === "md" ? null : size',
  },
})
export class AvatarComponent {
  @Input() name = '?';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  get initials(): string {
    return (this.name || '?')
      .split(/\s+/)
      .slice(0, 2)
      .map(w => w[0] || '')
      .join('')
      .toUpperCase();
  }
}
