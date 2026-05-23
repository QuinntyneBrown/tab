import { Dialog, DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AmountInputComponent } from '../amount-input/amount-input.component';
import { ButtonComponent } from '../button/button.component';
import { InputComponent } from '../input/input.component';

export interface LogBillPaymentDialogResult {
  amount: number;
  description: string;
  date: string;
  method?: string;
}

export interface LogBillPaymentDialogData {
  /** Pre-fill description with the bill name so the form is one tap away. */
  defaultDescription?: string;
  /** Pre-fill amount with the bill's expected amount. */
  defaultAmount?: string;
  submit: (entry: LogBillPaymentDialogResult) => Promise<void>;
}

@Component({
  selector: 'tab-log-bill-payment-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [FormsModule, AmountInputComponent, ButtonComponent, InputComponent],
  templateUrl: './log-bill-payment-dialog.component.html',
  styleUrl: './log-bill-payment-dialog.component.scss',
})
export class LogBillPaymentDialogComponent implements AfterViewInit {
  private readonly dialogRef =
    inject<DialogRef<LogBillPaymentDialogResult>>(DialogRef);
  private readonly data = inject<LogBillPaymentDialogData>(DIALOG_DATA);

  @ViewChild(AmountInputComponent)
  private readonly amountInputCmp?: AmountInputComponent;

  readonly amount = signal(this.data.defaultAmount ?? '');
  readonly description = signal(this.data.defaultDescription ?? '');
  readonly date = signal(new Date().toISOString().slice(0, 10));
  readonly method = signal('');
  readonly error = signal<string | null>(null);
  readonly busy = signal(false);

  readonly amountValue = computed(
    () => Number(this.amount().replace(/[^0-9.\-]/g, '')) || 0,
  );
  readonly amountInvalid = computed(() => this.amountValue() <= 0);
  readonly dateInvalid = computed(
    () => this.date() > new Date().toISOString().slice(0, 10),
  );
  readonly canSave = computed(
    () => !this.busy() && !this.amountInvalid() && !this.dateInvalid(),
  );

  ngAfterViewInit(): void {
    queueMicrotask(() => this.amountInputCmp?.focus());
  }

  cancel(): void {
    this.dialogRef.close();
  }

  async save(): Promise<void> {
    if (!this.canSave()) return;
    const entry: LogBillPaymentDialogResult = {
      amount: this.amountValue(),
      description: this.description(),
      date: this.date(),
      method: this.method() || undefined,
    };
    this.busy.set(true);
    this.error.set(null);
    try {
      await this.data.submit(entry);
      this.dialogRef.close(entry);
    } catch (err) {
      this.error.set(
        err instanceof Error && err.message
          ? err.message
          : 'Could not save bill payment.',
      );
    } finally {
      this.busy.set(false);
    }
  }
}

export async function openLogBillPaymentDialog(
  dialog: Dialog,
  data: LogBillPaymentDialogData,
): Promise<LogBillPaymentDialogResult | null> {
  const ref = dialog.open<LogBillPaymentDialogResult, LogBillPaymentDialogData>(
    LogBillPaymentDialogComponent,
    {
      data,
      hasBackdrop: true,
      disableClose: false,
      ariaModal: true,
      role: 'dialog',
      panelClass: 'tab-log-bill-payment-dialog__panel',
      backdropClass: 'tab-log-bill-payment-dialog__backdrop',
      autoFocus: false,
    },
  );
  return new Promise((resolve) => {
    ref.closed.subscribe((result) => resolve(result ?? null));
  });
}
