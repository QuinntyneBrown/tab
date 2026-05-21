import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  readonly path = '/login';

  readonly wordmark: Locator;
  readonly emailInput: Locator;
  readonly passcodeInput: Locator;
  readonly signInButton: Locator;
  readonly magicLinkButton: Locator;
  readonly formError: Locator;
  readonly formCard: Locator;

  constructor(page: Page) {
    super(page);
    this.wordmark = page.getByText(/^tab\.?$/);
    this.emailInput = page.getByLabel(/email/i);
    this.passcodeInput = page.getByLabel(/passcode/i);
    this.signInButton = page.getByRole('button', { name: /^sign in$/i });
    this.magicLinkButton = page.getByRole('button', { name: /magic link/i });
    this.formError = page.getByRole('alert');
    this.formCard = page.getByTestId('login-card');
  }

  async signIn(email: string, passcode: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passcodeInput.fill(passcode);
    await this.signInButton.click();
  }
}
