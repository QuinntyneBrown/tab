import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ApiError, STATEMENT_SERVICE } from 'api';
import {
  LedgerComponent,
  LedgerRowComponent,
  TotalsComponent,
  TotalsRowComponent,
} from 'components';

@Component({
  selector: 'app-shared-statement',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LedgerComponent, LedgerRowComponent, TotalsComponent, TotalsRowComponent],
  templateUrl: './shared-statement.page.html',
  styleUrl: './shared-statement.page.scss',
})
export class SharedStatementPage {
  private readonly statements = inject(STATEMENT_SERVICE);

  readonly token = input.required<string>();
  readonly statement = computed(() => this.statements.getShared(this.token()));

  errorIsExpired(error: unknown): boolean {
    return error instanceof ApiError && (error.status === 404 || error.status === 410);
  }
}
