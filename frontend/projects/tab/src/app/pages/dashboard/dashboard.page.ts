import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DASHBOARD_SERVICE, LOANS_SERVICE, LedgerEntry, ME_SERVICE, PAYMENTS_SERVICE } from 'api';
import {
  AddLoanDialogResult,
  AmountComponent,
  AppShellComponent,
  AvatarComponent,
  ButtonComponent,
  CardComponent,
  DividerComponent,
  EmptyComponent,
  EyebrowComponent,
  NavComponent,
  NudgeComponent,
  RecordPaymentDialogResult,
  RowComponent,
  SectionHeadComponent,
  openAddLoanDialog,
  openRecordPaymentDialog,
} from 'components';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AppShellComponent,
    AmountComponent,
    AvatarComponent,
    ButtonComponent,
    CardComponent,
    DividerComponent,
    EmptyComponent,
    EyebrowComponent,
    NavComponent,
    NudgeComponent,
    RowComponent,
    SectionHeadComponent,
  ],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
})
export class DashboardPage {
  private readonly dialog = inject(Dialog);
  private readonly router = inject(Router);
  private readonly loans = inject(LOANS_SERVICE);
  private readonly payments = inject(PAYMENTS_SERVICE);
  private readonly dashboardService = inject(DASHBOARD_SERVICE);
  private readonly meService = inject(ME_SERVICE);
  readonly dashboard = this.dashboardService.get();
  readonly me = this.meService.me();

  greeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  today(): string {
    return new Date().toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  }

  heroAriaLabel(amount: number, currency: string | undefined): string {
    const code = currency && currency.length === 3 ? currency : 'USD';
    const fmt = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: code,
      currencyDisplay: 'name',
    });
    return `Counterparty owes ${fmt.format(amount)}`;
  }

  async openAddLoan(): Promise<void> {
    const result = await openAddLoanDialog(this.dialog, {
      submit: async (entry: AddLoanDialogResult) => {
        await this.loans.create({
          amount: entry.amount,
          description: entry.description,
          date: entry.date,
          method: entry.method,
          note: entry.note,
        });
      },
    });
    if (result) this.dashboard.reload();
  }

  async openLogBill(): Promise<void> {
    // Dashboard shortcut into the bills page; the actual log-payment flow is
    // bill-card scoped under /bills (uses LogBillPaymentDialog).
    await this.router.navigateByUrl('/bills');
  }

  async openRecordPayment(): Promise<void> {
    const result = await openRecordPaymentDialog(this.dialog, {
      submit: async (entry: RecordPaymentDialogResult) => {
        await this.payments.create({
          amount: entry.amount,
          date: entry.date,
          method: entry.method,
        });
      },
    });
    if (result) this.dashboard.reload();
  }

  lastActivityDaysAgo(entries: readonly LedgerEntry[] | undefined): string | null {
    if (!entries || entries.length === 0) return null;
    const latest = new Date(entries[0].date);
    if (Number.isNaN(latest.getTime())) return null;
    const diffMs = Date.now() - latest.getTime();
    const days = Math.max(0, Math.round(diffMs / 86_400_000));
    if (days === 0) return 'today';
    if (days === 1) return 'yesterday';
    return `${days} days ago`;
  }
}
