import { Page, Locator } from '@playwright/test';

export abstract class BasePage {
  constructor(public readonly page: Page) {}

  abstract readonly path: string;

  async goto(query: Record<string, string> = {}): Promise<void> {
    const search = new URLSearchParams(query).toString();
    const url = search ? `${this.path}?${search}` : this.path;
    await this.page.goto(url);
  }

  heading(level: 1 | 2 | 3 = 1, name?: string | RegExp): Locator {
    return this.page.getByRole('heading', { level, name });
  }

  toast(text: string | RegExp): Locator {
    return this.page.getByRole('status').filter({ hasText: text });
  }
}
