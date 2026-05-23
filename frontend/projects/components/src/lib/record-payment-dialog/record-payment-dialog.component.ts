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

export interface RecordPaymentDialogResult {
  amount: number;
  date: string;
  method?: string;
}

export interface RecordPaymentDialogData {
  submit: (entry: RecordPaymentDialogResult) => Promise<void>;
}

@Component({
  selector: 'tab-record-payment-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [FormsModule, AmountInputComponent, ButtonComponent, InputComponent],
  templateUrl: './record-payment-dialog.component.html',
  styleUrl: './record-payment-dialog.component.scss',
})
export class RecordPaymentDialogComponent implements AfterViewInit {
  private readonly dialogRef =
    inject<DialogRef<RecordPaymentDialogResult>>(DialogRef);
  private readonly data = inject<RecordPaymentDialogData>(DIALOG_DATA);

  @ViewChild(AmountInputComponent)
  private readonly amountInputCmp?: AmountInputComponent;

  readonly amount = signal('');
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
    const entry: RecordPaymentDialogResult = {
      amount: this.amountValue(),
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
          : 'Could not record payment.',
      );
    } finally {
      this.busy.set(false);
    }
  }
}

export async function openRecordPaymentDialog(
  dialog: Dialog,
  data: RecordPaymentDialogData,
): Promise<RecordPaymentDialogResult | null> {
  const ref = dialog.open<RecordPaymentDialogResult, RecordPaymentDialogData>(
    RecordPaymentDialogComponent,
    {
      data,
      hasBackdrop: true,
      disableClose: false,
      ariaModal: true,
      role: 'dialog',
      panelClass: 'tab-record-payment-dialog__panel',
      backdropClass: 'tab-record-payment-dialog__backdrop',
      autoFocus: false,
    },
  );
  return new Promise((resolve) => {
    ref.closed.subscribe((result) => resolve(result ?? null));
  });
}
