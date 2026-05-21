import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewEncapsulation,
} from '@angular/core';

/**
 * Responsive app shell. See docs/components/app-shell.md.
 *
 * Encapsulation is `None` so the `.app` class — referenced by the global
 * `:has(tab-nav)` selectors in base.scss — keeps working unmodified across
 * every screen. The shell does no styling of its own here; it simply renders
 * the `.app` wrapper and content. All layout rules live in base.scss.
 */
@Component({
  selector: 'tab-app-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="app" [class.no-nav]="noNav" [class.statement-app]="statement">
      <ng-content></ng-content>
    </div>
  `,
  styles: [],
})
export class AppShellComponent {
  @Input({ transform: booleanAttribute }) noNav = false;
  @Input({ transform: booleanAttribute }) statement = false;
}
