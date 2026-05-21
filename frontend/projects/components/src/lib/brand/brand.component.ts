import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewEncapsulation,
} from '@angular/core';

/**
 * "tab." wordmark. See docs/components/tab-brand.md.
 */
@Component({
  selector: 'tab-brand',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  templateUrl: './brand.component.html',
  styleUrl: './brand.component.scss',
  host: {
    'role': 'img',
    'aria-label': 'tab',
    '[attr.size]': 'size === "md" ? null : size',
  },
})
export class BrandComponent {
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() dotStyle: 'inline' | 'pill' = 'inline';
}
