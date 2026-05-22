import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LOANS_SERVICE, LedgerEntry, LedgerEntryType } from 'api';
import {
  AmountComponent,
  AppShellComponent,
  AvatarComponent,
  CardComponent,
  EmptyComponent,
  NavComponent,
  RowComponent,
  SegmentedComponent,
  TabSegment,
} from 'components';

type Filter = 'all' | LedgerEntryType;

interface MonthGroup {
  key: string;
  label: string;
  net: number;
  entries: readonly LedgerEntry[];
}

@Component({
  selector: 'app-loans',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AppShellComponent,
    AmountComponent,
    AvatarComponent,
    CardComponent,
    EmptyComponent,
    NavComponent,
    RowComponent,
    SegmentedComponent,
  ],
  templateUrl: './loans.page.html',
  styleUrl: './loans.page.scss',
})
export class LoansPage {
  private readonly router = inject(Router);
  readonly ledger = inject(LOANS_SERVICE).list();

  readonly filter = signal<Filter>('all');
  readonly segments: TabSegment[] = [
    { key: 'all', label: 'All' },
    { key: 'loan', label: 'Loans' },
    { key: 'bill', label: 'Bills' },
    { key: 'payment', label: 'Payments' },
  ];

  readonly summary = computed(() => {
    const entries = this.ledger.value() ?? [];
    let lent = 0;
    let bills = 0;
    let paid = 0;
    for (const e of entries) {
      if (e.type === 'loan') lent += e.counterpartyShare;
      else if (e.type === 'bill') bills += e.counterpartyShare;
      else paid += e.counterpartyShare;
    }
    return { lent, bills, paid, net: lent + bills - paid, entryCount: entries.length };
  });

  readonly groups = computed<readonly MonthGroup[]>(() => {
    const entries = this.ledger.value() ?? [];
    const active = this.filter();
    const filtered = active === 'all' ? entries : entries.filter((e) => e.type === active);
    const byMonth = new Map<string, LedgerEntry[]>();
    for (const entry of filtered) {
      const key = entry.date.slice(0, 7);
      const bucket = byMonth.get(key) ?? [];
      bucket.push(entry);
      byMonth.set(key, bucket);
    }
    return [...byMonth.entries()]
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([key, list]) => {
        const net = list.reduce(
          (sum, e) => sum + (e.type === 'payment' ? -e.counterpartyShare : e.counterpartyShare),
          0,
        );
        return { key, label: formatMonth(key), net, entries: list };
      });
  });

  setFilter(key: string): void {
    this.filter.set(key as Filter);
  }

  formatSigned(n: number): string {
    const sign = n >= 0 ? '+' : '−';
    return `${sign} $${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  openEntry(entry: LedgerEntry): void {
    if (entry.type === 'loan') this.router.navigate(['/loans', entry.id, 'edit']);
  }
}

function formatMonth(yyyyMm: string): string {
  const [y, m] = yyyyMm.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, 1));
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}
