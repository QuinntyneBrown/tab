import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

export type TabNavKey = 'dashboard' | 'calendar' | 'loans' | 'bills' | 'settings';

export interface TabNavItem {
  key: TabNavKey;
  label: string;
  href: string;
  iconPaths: string;
}

/**
 * Primary navigation. See docs/components/tab-nav.md.
 * Mirrors docs/mocks/assets/js/components.js:462-578.
 *
 * Icon path data copied verbatim from components.js:558-566.
 */
@Component({
  selector: 'tab-nav',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // ShadowDom isolated the original styles but also prevented `RouterLink` from
  // resolving its host anchor reliably across the shadow boundary. The nav's
  // styles are class-scoped (`.nav__*`) so emulated encapsulation is enough.
  encapsulation: ViewEncapsulation.Emulated,
  imports: [RouterLink],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.scss',
})
export class NavComponent {
  @Input() active: TabNavKey | null = null;
  @Input() items: TabNavItem[] = [
    {
      key: 'dashboard',
      label: 'Home',
      href: '/dashboard',
      iconPaths: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
    },
    {
      key: 'calendar',
      label: 'Calendar',
      href: '/calendar',
      iconPaths:
        '<rect x="3" y="5" width="18" height="16" rx="2"/>' +
        '<path d="M3 9h18"/><path d="M8 3v4M16 3v4"/>',
    },
    {
      key: 'loans',
      label: 'Loans',
      href: '/loans',
      iconPaths: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/>',
    },
    {
      key: 'bills',
      label: 'Bills',
      href: '/bills',
      iconPaths: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z"/><path d="M9 8h6M9 12h6"/>',
    },
    {
      key: 'settings',
      label: 'Settings',
      href: '/settings',
      iconPaths:
        '<circle cx="12" cy="12" r="3"/>' +
        '<path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.11-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06A2 2 0 1 1 4.13 16.92l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.65 8.85a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H9a1.7 1.7 0 0 0 1.03-1.56V3a2 2 0 1 1 4 0v.09c0 .67.4 1.27 1.03 1.56a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V9c.29.63.89 1.03 1.56 1.03H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.56 1.03z"/>',
    },
  ];

  @Output() navigate = new EventEmitter<TabNavItem>();

  private sanitizer = inject(DomSanitizer);

  iconFor(item: TabNavItem): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(item.iconPaths);
  }
}
