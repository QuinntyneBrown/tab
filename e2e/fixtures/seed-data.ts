export interface SeedLoan {
  amount: number;
  description: string;
  date: string;
  method?: string;
  note?: string;
}

export interface SeedBill {
  name: string;
  vendor?: string;
  expectedAmount: number;
  dueDay: number;
  splitPercent: number;
}

export interface SeedPayment {
  amount: number;
  date: string;
  method?: string;
}

export const sampleLoans: SeedLoan[] = [
  { amount: 120.0, description: 'Groceries — Loblaws', date: '2026-05-18', method: 'Cash' },
  { amount: 40.0, description: 'Bus fare', date: '2026-04-27', method: 'Cash' },
  { amount: 80.0, description: 'Movie night', date: '2026-03-12', method: 'e-transfer' },
];

export const sampleBills: SeedBill[] = [
  { name: 'Hydro', vendor: 'Hydro One', expectedAmount: 168, dueDay: 15, splitPercent: 50 },
  { name: 'Internet', vendor: 'Bell', expectedAmount: 95, dueDay: 22, splitPercent: 50 },
  { name: 'Phone', vendor: 'Rogers', expectedAmount: 70, dueDay: 5, splitPercent: 50 },
];

export const samplePayments: SeedPayment[] = [
  { amount: 100, date: '2026-04-14', method: 'e-transfer' },
];
