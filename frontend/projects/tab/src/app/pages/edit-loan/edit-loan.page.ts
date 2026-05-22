import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { ApiError, LOANS_SERVICE } from 'api';
import {
  AppShellComponent,
  ButtonComponent,
  HeaderComponent,
  InputComponent,
} from 'components';

@Component({
  selector: 'app-edit-loan',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AppShellComponent,
    ButtonComponent,
    HeaderComponent,
    InputComponent,
  ],
  templateUrl: './edit-loan.page.html',
  styleUrl: './edit-loan.page.scss',
})
export class EditLoanPage {
  private readonly loans = inject(LOANS_SERVICE);
  private readonly router = inject(Router);

  readonly id = input.required<string>();
  readonly query = computed(() => this.loans.get(this.id()));

  readonly amount = signal('');
  readonly description = signal('');
  readonly date = signal('');
  readonly method = signal('');
  readonly note = signal('');
  readonly error = signal<string | null>(null);
  readonly busy = signal(false);

  constructor() {
    effect(() => {
      const loan = this.query().value();
      if (!loan) return;
      this.amount.set(String(loan.amount));
      this.description.set(loan.description);
      this.date.set(loan.date);
      this.method.set(loan.method ?? '');
      this.note.set(loan.note ?? '');
    });
  }

  async save(): Promise<void> {
    this.busy.set(true);
    this.error.set(null);
    try {
      await this.loans.update(this.id(), {
        amount: Number(this.amount()),
        description: this.description(),
        date: this.date(),
        method: this.method() || undefined,
        note: this.note() || undefined,
      });
      await this.router.navigateByUrl('/loans');
    } catch (err) {
      this.error.set(err instanceof ApiError ? err.problem.title : 'Could not save.');
    } finally {
      this.busy.set(false);
    }
  }

  async remove(): Promise<void> {
    if (!confirm('Delete this entry? It will be removed from the ledger and statement.')) return;
    this.busy.set(true);
    try {
      await this.loans.delete(this.id());
      await this.router.navigateByUrl('/loans');
    } catch (err) {
      this.error.set(err instanceof ApiError ? err.problem.title : 'Could not delete.');
    } finally {
      this.busy.set(false);
    }
  }
}
