import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ApiError, STATEMENT_SERVICE } from 'api';
import {
  AppShellComponent,
  ButtonComponent,
  HeaderComponent,
  InputComponent,
  LedgerComponent,
  LedgerRowComponent,
  TotalsComponent,
  TotalsRowComponent,
} from 'components';

@Component({
  selector: 'app-statement',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AppShellComponent,
    ButtonComponent,
    HeaderComponent,
    InputComponent,
    LedgerComponent,
    LedgerRowComponent,
    TotalsComponent,
    TotalsRowComponent,
  ],
  templateUrl: './statement.page.html',
  styleUrl: './statement.page.scss',
})
export class StatementPage {
  private readonly statements = inject(STATEMENT_SERVICE);
  readonly statement = this.statements.get();

  readonly from = signal<string>('');
  readonly to = signal<string>('');
  readonly toast = signal<string | null>(null);

  refresh(): void {
    this.statement.reload();
  }

  async share(): Promise<void> {
    const data = this.statement.value();
    if (!data) return;
    try {
      const link = await this.statements.share({ from: data.from, to: data.to });
      await navigator.clipboard.writeText(link.url);
      this.toast.set('Link copied');
      setTimeout(() => this.toast.set(null), 3000);
    } catch (err) {
      this.toast.set(err instanceof ApiError ? err.problem.title : 'Could not create share link.');
    }
  }
}
