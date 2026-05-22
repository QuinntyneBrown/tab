import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ApiError,
  LOANS_SERVICE,
  PAYMENTS_SERVICE,
} from 'api';
import {
  AmountInputComponent,
  AppShellComponent,
  ButtonComponent,
  HeaderComponent,
  InputComponent,
  SegmentedComponent,
  TabSegment,
} from 'components';

type Mode = 'loan' | 'bill' | 'payment';

@Component({
  selector: 'app-add-entry',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    AmountInputComponent,
    AppShellComponent,
    ButtonComponent,
    HeaderComponent,
    InputComponent,
    SegmentedComponent,
  ],
  templateUrl: './add-entry.page.html',
  styleUrl: './add-entry.page.scss',
})
export class AddEntryPage {
  private readonly loans = inject(LOANS_SERVICE);
  private readonly payments = inject(PAYMENTS_SERVICE);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly mode = signal<Mode>(
    (this.route.snapshot.queryParamMap.get('mode') as Mode | null) ?? 'loan',
  );
  readonly segments: TabSegment[] = [
    { key: 'loan', label: 'Loan' },
    { key: 'bill', label: 'Bill payment' },
    { key: 'payment', label: 'Payment in' },
  ];
  readonly quickAmounts = [20, 50, 100, 200] as const;

  quickFill(amount: number): void {
    this.amount.set(amount.toFixed(2));
  }

  readonly amount = signal('');
  readonly description = signal('');
  readonly date = signal(new Date().toISOString().slice(0, 10));
  readonly method = signal('');
  readonly note = signal('');
  readonly error = signal<string | null>(null);
  readonly busy = signal(false);

  readonly amountValue = computed(() =>
    Number(this.amount().replace(/[^0-9.\-]/g, '')) || 0,
  );

  readonly amountInvalid = computed(() => this.amountValue() <= 0);
  readonly dateInvalid = computed(() => this.date() > new Date().toISOString().slice(0, 10));
  readonly canSave = computed(
    () => !this.busy() && !this.amountInvalid() && !this.dateInvalid(),
  );

  readonly amountLabel = computed(() => {
    switch (this.mode()) {
      case 'loan': return 'Amount lent';
      case 'bill': return 'Amount paid';
      case 'payment': return 'Amount received';
    }
  });

  setMode(key: string): void {
    this.mode.set(key as Mode);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { mode: key },
      queryParamsHandling: 'merge',
    });
  }

  async save(): Promise<void> {
    if (!this.canSave()) return;
    this.busy.set(true);
    this.error.set(null);
    try {
      if (this.mode() === 'payment') {
        await this.payments.create({
          amount: this.amountValue(),
          date: this.date(),
          method: this.method() || undefined,
        });
      } else {
        await this.loans.create({
          amount: this.amountValue(),
          description: this.description(),
          date: this.date(),
          method: this.method() || undefined,
          note: this.note() || undefined,
        });
      }
      await this.router.navigateByUrl('/dashboard');
    } catch (err) {
      this.error.set(err instanceof ApiError ? err.problem.title : 'Could not save entry.');
    } finally {
      this.busy.set(false);
    }
  }
}
