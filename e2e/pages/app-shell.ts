import { Locator, Page } from '@playwright/test';

/**
 * App shell: top brand, bottom nav (XS/S/M), sidebar (L/XL).
 * Selectors map to the responsive shell defined by L2-028.
 */
export class AppShell {
  readonly bottomNav: Locator;
  readonly sidebar: Locator;
  readonly brand: Locator;

  constructor(public readonly page: Page) {
    this.bottomNav = page.getByRole('navigation', { name: /primary|bottom/i });
    this.sidebar = page.getByRole('navigation', { name: /sidebar/i });
    this.brand = page.getByRole('link', { name: /^tab\.?$/i });
  }

  navTab(name: 'Home' | 'Loans' | 'Bills' | 'Settings'): Locator {
    return this.page
      .getByRole('navigation')
      .getByRole('link', { name: new RegExp(`^${name}$`, 'i') });
  }

  activeTab(): Locator {
    return this.page.getByRole('navigation').locator('[aria-current="page"]');
  }

  avatar(): Locator {
    return this.page.getByTestId('app-avatar');
  }
}
