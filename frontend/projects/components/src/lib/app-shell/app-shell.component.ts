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
 * Encapsulation is `None` so the `.app` block class — referenced by the global
 * `:has(tab-nav)` selectors in base.scss — keeps working unmodified across
 * every screen. The shell does no styling of its own here; it simply renders
 * the `.app` wrapper with optional BEM modifiers. All layout rules live in
 * base.scss.
 */
@Component({
  selector: 'tab-app-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
})
export class AppShellComponent {
  @Input({ transform: booleanAttribute }) noNav = false;
  @Input({ transform: booleanAttribute }) statement = false;
}
