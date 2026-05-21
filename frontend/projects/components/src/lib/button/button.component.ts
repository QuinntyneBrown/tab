import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';

/**
 * The single button primitive. See docs/components/tab-button.md.
 * Mirrors docs/mocks/assets/js/components.js:23-86 (TabButton custom element).
 */
@Component({
  selector: 'tab-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  host: {
    '[attr.full]': 'full ? "" : null',
    '[attr.disabled]': 'disabled ? "" : null',
  },
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'ghost' | 'quiet' = 'primary';
  @Input() size: 'md' | 'sm' = 'md';
  @Input({ transform: booleanAttribute }) full = false;
  @Input({ transform: booleanAttribute }) disabled = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';

  @Output('click') tabClick = new EventEmitter<MouseEvent>();

  emitClick(e: MouseEvent): void {
    if (this.disabled) {
      e.stopPropagation();
      e.preventDefault();
      return;
    }
    this.tabClick.emit(e);
  }
}
