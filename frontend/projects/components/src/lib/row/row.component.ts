import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';

/**
 * Three-column list row. See docs/components/tab-row.md.
 * Mirrors docs/mocks/assets/js/components.js:321-370.
 */
@Component({
  selector: 'tab-row',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  templateUrl: './row.component.html',
  styleUrl: './row.component.scss',
  host: {
    '[attr.interactive]': 'interactive ? "" : null',
    '[attr.last]':        'last ? "" : null',
    '[attr.role]':        'interactive ? "button" : null',
    '[attr.tabindex]':    'interactive ? 0 : null',
  },
})
export class RowComponent {
  @Input({ transform: booleanAttribute }) interactive = false;
  @Input({ transform: booleanAttribute }) last = false;

  @Output('click') rowClick = new EventEmitter<MouseEvent>();

  onClick(e: MouseEvent): void {
    if (this.interactive) this.rowClick.emit(e);
  }

  @HostListener('keydown', ['$event'])
  onKey(e: KeyboardEvent): void {
    if (!this.interactive) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.rowClick.emit(new MouseEvent('click'));
    }
  }
}
