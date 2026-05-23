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

/** Submitted-loan payload returned to the caller. */
export interface AddLoanDialogResult {
  amount: number;
  description: string;
  date: string;
  method?: string;
  note?: string;
}

export interface AddLoanDialogData {
  submit: (entry: AddLoanDialogResult) => Promise<void>;
}

@Component({
  selector: 'tab-add-loan-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [FormsModule, AmountInputComponent, ButtonComponent, InputComponent],
  templateUrl: './add-loan-dialog.component.html',
  styleUrl: './add-loan-dialog.component.scss',
})
export class AddLoanDialogComponent implements AfterViewInit {
  private readonly dialogRef =
    inject<DialogRef<AddLoanDialogResult>>(DialogRef);
  private readonly data = inject<AddLoanDialogData>(DIALOG_DATA);

  @ViewChild(AmountInputComponent)
  private readonly amountInputCmp?: AmountInputComponent;

  readonly amount = signal('');
  readonly description = signal('');
  readonly date = signal(new Date().toISOString().slice(0, 10));
  readonly method = signal('');
  readonly note = signal('');
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
    const entry: AddLoanDialogResult = {
      amount: this.amountValue(),
      description: this.description(),
      date: this.date(),
      method: this.method() || undefined,
      note: this.note() || undefined,
    };
    this.busy.set(true);
    this.error.set(null);
    try {
      await this.data.submit(entry);
      this.dialogRef.close(entry);
    } catch (err) {
      this.error.set(
        err instanceof Error && err.message ? err.message : 'Could not save loan.',
      );
    } finally {
      this.busy.set(false);
    }
  }
}

export async function openAddLoanDialog(
  dialog: Dialog,
  data: AddLoanDialogData,
): Promise<AddLoanDialogResult | null> {
  const ref = dialog.open<AddLoanDialogResult, AddLoanDialogData>(
    AddLoanDialogComponent,
    {
      data,
      hasBackdrop: true,
      disableClose: false,
      ariaModal: true,
      role: 'dialog',
      panelClass: 'tab-add-loan-dialog__panel',
      backdropClass: 'tab-add-loan-dialog__backdrop',
      autoFocus: false,
    },
  );
  return new Promise((resolve) => {
    ref.closed.subscribe((result) => resolve(result ?? null));
  });
}
