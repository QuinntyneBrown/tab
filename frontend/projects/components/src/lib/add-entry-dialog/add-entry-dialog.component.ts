import { Dialog, DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AmountInputComponent } from '../amount-input/amount-input.component';
import { ButtonComponent } from '../button/button.component';
import { InputComponent } from '../input/input.component';
import { SegmentedComponent, TabSegment } from '../segmented/segmented.component';

export type AddEntryMode = 'loan' | 'bill' | 'payment';

/** Form values returned to the caller after a successful submit. */
export interface AddEntryDialogResult {
  mode: AddEntryMode;
  amount: number;
  description: string;
  date: string;
  method?: string;
  note?: string;
}

/**
 * Data passed to the dialog via `Dialog.open(..., { data })`.
 * `submit` performs the persistence side-effect. The dialog keeps its busy /
 * error UI internal so a failed save preserves the user's form data. The
 * dialog only closes (with the submitted values as the result) once `submit`
 * resolves; if it throws, the error message is surfaced in-place.
 */
export interface AddEntryDialogData {
  mode?: AddEntryMode;
  submit: (entry: AddEntryDialogResult) => Promise<void>;
}

@Component({
  selector: 'tab-add-entry-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    FormsModule,
    AmountInputComponent,
    ButtonComponent,
    InputComponent,
    SegmentedComponent,
  ],
  templateUrl: './add-entry-dialog.component.html',
  styleUrl: './add-entry-dialog.component.scss',
})
export class AddEntryDialogComponent {
  private readonly dialogRef =
    inject<DialogRef<AddEntryDialogResult>>(DialogRef);
  private readonly data = inject<AddEntryDialogData>(DIALOG_DATA);

  readonly mode = signal<AddEntryMode>(this.data.mode ?? 'loan');
  readonly segments: TabSegment[] = [
    { key: 'loan', label: 'Loan' },
    { key: 'bill', label: 'Bill payment' },
    { key: 'payment', label: 'Payment in' },
  ];

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

  readonly amountLabel = computed(() => {
    switch (this.mode()) {
      case 'loan':
        return 'Amount lent';
      case 'bill':
        return 'Amount paid';
      case 'payment':
        return 'Amount received';
    }
  });

  readonly title = computed(() => {
    switch (this.mode()) {
      case 'loan':
        return 'Add a loan';
      case 'bill':
        return 'Log a bill payment';
      case 'payment':
        return 'Record a payment';
    }
  });

  setMode(key: string): void {
    this.mode.set(key as AddEntryMode);
  }

  cancel(): void {
    this.dialogRef.close();
  }

  async save(): Promise<void> {
    if (!this.canSave()) return;
    const entry: AddEntryDialogResult = {
      mode: this.mode(),
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
        err instanceof Error && err.message
          ? err.message
          : 'Could not save entry.',
      );
    } finally {
      this.busy.set(false);
    }
  }
}

/**
 * Helper for callers: opens the dialog with sensible defaults.
 * Returns a promise resolving to the submitted values, or `null` if cancelled.
 */
export async function openAddEntryDialog(
  dialog: Dialog,
  data: AddEntryDialogData,
): Promise<AddEntryDialogResult | null> {
  const ref = dialog.open<AddEntryDialogResult, AddEntryDialogData>(
    AddEntryDialogComponent,
    {
      data,
      hasBackdrop: true,
      disableClose: false,
      ariaModal: true,
      role: 'dialog',
      panelClass: 'tab-add-entry-dialog__panel',
      backdropClass: 'tab-add-entry-dialog__backdrop',
    },
  );
  return new Promise((resolve) => {
    ref.closed.subscribe((result) => resolve(result ?? null));
  });
}
