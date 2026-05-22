import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DASHBOARD_SERVICE, LedgerEntry } from 'api';
import {
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
  RowComponent,
  SectionHeadComponent,
} from 'components';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
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
  readonly dashboard = inject(DASHBOARD_SERVICE).get();

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

  heroAriaLabel(amount: number, currency: string): string {
    const fmt = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      currencyDisplay: 'name',
    });
    return `Counterparty owes ${fmt.format(amount)}`;
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
