import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ApiError,
  BILLS_SERVICE,
  RecurringBill,
} from 'api';
import {
  AppShellComponent,
  BillCardComponent,
  ButtonComponent,
  EmptyComponent,
  InputComponent,
  LogBillPaymentDialogResult,
  NavComponent,
  openLogBillPaymentDialog,
} from 'components';

interface DraftBill {
  name: string;
  vendor: string;
  expectedAmount: string;
  dueDay: string;
  splitPercent: string;
}

@Component({
  selector: 'app-bills',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    AppShellComponent,
    BillCardComponent,
    ButtonComponent,
    EmptyComponent,
    InputComponent,
    NavComponent,
  ],
  templateUrl: './bills.page.html',
  styleUrl: './bills.page.scss',
})
export class BillsPage {
  private readonly bills = inject(BILLS_SERVICE);
  private readonly dialog = inject(Dialog);
  readonly billsQuery = this.bills.list();

  readonly editorOpen = signal(false);
  readonly editing = signal<RecurringBill | null>(null);
  readonly draft = signal<DraftBill>(blankDraft());
  readonly error = signal<string | null>(null);
  readonly busy = signal(false);

  daysUntil(bill: RecurringBill): number {
    const due = new Date(`${bill.nextDueDate}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.round((due.getTime() - today.getTime()) / 86400000);
  }

  badge(bill: RecurringBill): { text: string; dot?: boolean; variant?: 'default' | 'quiet' } {
    const days = this.daysUntil(bill);
    if (days < 7) return { text: `Due in ${days}d`, dot: true };
    const [_y, m, d] = bill.nextDueDate.split('-').map(Number);
    const month = new Date(2000, m - 1, d).toLocaleString('en-US', { month: 'short' });
    return { text: `Next: ${month} ${d}`, variant: 'quiet' };
  }

  share(bill: RecurringBill): number {
    return (bill.expectedAmount * bill.splitPercent) / 100;
  }

  openCreate(): void {
    this.editing.set(null);
    this.draft.set(blankDraft());
    this.error.set(null);
    this.editorOpen.set(true);
  }

  openEdit(bill: RecurringBill): void {
    this.editing.set(bill);
    this.draft.set({
      name: bill.name,
      vendor: bill.vendor ?? '',
      expectedAmount: String(bill.expectedAmount),
      dueDay: String(bill.dueDay),
      splitPercent: String(bill.splitPercent),
    });
    this.error.set(null);
    this.editorOpen.set(true);
  }

  close(): void {
    this.editorOpen.set(false);
  }

  async save(): Promise<void> {
    const d = this.draft();
    this.busy.set(true);
    this.error.set(null);
    try {
      const payload = {
        name: d.name.trim(),
        vendor: d.vendor.trim() || undefined,
        expectedAmount: Number(d.expectedAmount),
        dueDay: Number(d.dueDay),
        splitPercent: Number(d.splitPercent),
      };
      const existing = this.editing();
      if (existing) await this.bills.update(existing.id, payload);
      else await this.bills.create(payload);
      this.billsQuery.reload();
      this.editorOpen.set(false);
    } catch (err) {
      this.error.set(err instanceof ApiError ? err.problem.title : 'Could not save bill.');
    } finally {
      this.busy.set(false);
    }
  }

  async markPaid(bill: RecurringBill): Promise<void> {
    const today = new Date().toISOString().slice(0, 10);
    const period = today.slice(0, 7);
    try {
      await this.bills.markPaidInFull(bill.id, { period, date: today });
      this.billsQuery.reload();
    } catch (err) {
      this.error.set(err instanceof ApiError ? err.problem.title : 'Could not record payment.');
    }
  }

  async logThisMonth(bill: RecurringBill): Promise<void> {
    const result = await openLogBillPaymentDialog(this.dialog, {
      defaultDescription: bill.name,
      defaultAmount: String(bill.expectedAmount),
      submit: async (entry: LogBillPaymentDialogResult) => {
        const period = entry.date.slice(0, 7);
        await this.bills.logPayment(bill.id, {
          period,
          date: entry.date,
          actualAmount: entry.amount,
        });
      },
    });
    if (result) this.billsQuery.reload();
  }

  async archive(): Promise<void> {
    const existing = this.editing();
    if (!existing) return;
    if (!confirm(`Archive ${existing.name}? Past postings remain in the ledger.`)) return;
    try {
      await this.bills.archive(existing.id);
      this.billsQuery.reload();
      this.editorOpen.set(false);
    } catch (err) {
      this.error.set(err instanceof ApiError ? err.problem.title : 'Could not archive bill.');
    }
  }

  patchDraft<K extends keyof DraftBill>(key: K, value: string): void {
    this.draft.update((d) => ({ ...d, [key]: value }));
  }
}

function blankDraft(): DraftBill {
  return { name: '', vendor: '', expectedAmount: '', dueDay: '1', splitPercent: '50' };
}
