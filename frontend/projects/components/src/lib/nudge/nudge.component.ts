import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewEncapsulation,
} from '@angular/core';

/**
 * Dashed informational card (dashboard heads-up).
 * See docs/components/tab-nudge.md.
 */
@Component({
  selector: 'tab-nudge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  templateUrl: './nudge.component.html',
  styleUrl: './nudge.component.scss',
})
export class NudgeComponent {
  @Input() label: string | null = null;
}
