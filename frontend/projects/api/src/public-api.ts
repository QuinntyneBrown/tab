/*
 * Public API Surface of @tab/api
 *
 * Per L2-036, only interfaces, injection tokens, DTO/model types, and the
 * `provide…` factory functions are exported. Concrete HTTP implementations are
 * kept internal so consumers cannot accidentally depend on them.
 */

// Common
export { API_BASE_URL } from './lib/common/api-base-url.token';
export { CORRELATION_ID_HEADER } from './lib/common/correlation-id.constant';
export { ApiError } from './lib/common/api-error';
export type { ProblemDetails } from './lib/common/problem-details.interface';
export type { QueryResult } from './lib/common/query-result.interface';
export type { QueryStatus } from './lib/common/query-status.type';

// Auth
export { AUTH_SERVICE } from './lib/auth/auth-service.token';
export { provideAuthService } from './lib/auth/provide-auth-service';
export type { IAuthService } from './lib/auth/auth-service.interface';
export type { SignInRequest } from './lib/auth/sign-in-request.interface';
export type { TokenGrantType } from './lib/auth/token-grant-type.type';
export type { TokenRequest } from './lib/auth/token-request.interface';
export type { TokenResponse } from './lib/auth/token-response.interface';

// Me
export { ME_SERVICE } from './lib/me/me-service.token';
export { provideMeService } from './lib/me/provide-me-service';
export type { IMeService } from './lib/me/me-service.interface';
export type { CurrentUser } from './lib/me/current-user.interface';

// Counterparty
export { COUNTERPARTY_SERVICE } from './lib/counterparty/counterparty-service.token';
export { provideCounterpartyService } from './lib/counterparty/provide-counterparty-service';
export type { ICounterpartyService } from './lib/counterparty/counterparty-service.interface';
export type { Counterparty } from './lib/counterparty/counterparty.interface';
export type { UpdateCounterpartyRequest } from './lib/counterparty/update-counterparty-request.interface';

// Balance
export { BALANCE_SERVICE } from './lib/balance/balance-service.token';
export { provideBalanceService } from './lib/balance/provide-balance-service';
export type { IBalanceService } from './lib/balance/balance-service.interface';
export type { Balance } from './lib/balance/balance.interface';

// Dashboard
export { DASHBOARD_SERVICE } from './lib/dashboard/dashboard-service.token';
export { provideDashboardService } from './lib/dashboard/provide-dashboard-service';
export type { IDashboardService } from './lib/dashboard/dashboard-service.interface';
export type { DashboardNudge } from './lib/dashboard/dashboard-nudge.interface';
export type { DashboardPayload } from './lib/dashboard/dashboard-payload.interface';
export type { MonthlySummary } from './lib/dashboard/monthly-summary.interface';

// Ledger / loans
export { LOANS_SERVICE } from './lib/ledger/loans-service.token';
export { provideLoansService } from './lib/ledger/provide-loans-service';
export type { ILoansService } from './lib/ledger/loans-service.interface';
export type { CreateLoanRequest } from './lib/ledger/create-loan-request.interface';
export type { LedgerEntry } from './lib/ledger/ledger-entry.interface';
export type { LedgerEntryType } from './lib/ledger/ledger-entry-type.type';
export type { LedgerQuery } from './lib/ledger/ledger-query.interface';
export type { Loan } from './lib/ledger/loan.interface';
export type { UpdateLoanRequest } from './lib/ledger/update-loan-request.interface';

// Bills
export { BILLS_SERVICE } from './lib/bills/bills-service.token';
export { provideBillsService } from './lib/bills/provide-bills-service';
export type { IBillsService } from './lib/bills/bills-service.interface';
export type { BillCadence } from './lib/bills/bill-cadence.type';
export type { BillPosting } from './lib/bills/bill-posting.interface';
export type { CreateRecurringBillRequest } from './lib/bills/create-recurring-bill-request.interface';
export type { LogBillPaymentRequest } from './lib/bills/log-bill-payment-request.interface';
export type { MarkBillPaidRequest } from './lib/bills/mark-bill-paid-request.interface';
export type { RecurringBill } from './lib/bills/recurring-bill.interface';
export type { UpdateRecurringBillRequest } from './lib/bills/update-recurring-bill-request.interface';

// Payments
export { PAYMENTS_SERVICE } from './lib/payments/payments-service.token';
export { providePaymentsService } from './lib/payments/provide-payments-service';
export type { IPaymentsService } from './lib/payments/payments-service.interface';
export type { CreatePaymentRequest } from './lib/payments/create-payment-request.interface';
export type { PaymentIn } from './lib/payments/payment-in.interface';

// Statement
export { STATEMENT_SERVICE } from './lib/statement/statement-service.token';
export { provideStatementService } from './lib/statement/provide-statement-service';
export type { IStatementService } from './lib/statement/statement-service.interface';
export type { ShareLink } from './lib/statement/share-link.interface';
export type { ShareLinkRequest } from './lib/statement/share-link-request.interface';
export type { Statement } from './lib/statement/statement.interface';
export type { StatementEntry } from './lib/statement/statement-entry.interface';
export type { StatementQuery } from './lib/statement/statement-query.interface';
export type { StatementTotals } from './lib/statement/statement-totals.interface';

// Preferences
export { PREFERENCES_SERVICE } from './lib/preferences/preferences-service.token';
export { providePreferencesService } from './lib/preferences/provide-preferences-service';
export type { IPreferencesService } from './lib/preferences/preferences-service.interface';
export type { Preferences } from './lib/preferences/preferences.interface';
export type { UpdatePreferencesRequest } from './lib/preferences/update-preferences-request.interface';

// Export
export { EXPORT_SERVICE } from './lib/export/export-service.token';
export { provideExportService } from './lib/export/provide-export-service';
export type { IExportService } from './lib/export/export-service.interface';
export type { CsvExport } from './lib/export/csv-export.interface';

// Aggregate provider
export { provideTabApi } from './lib/provide-tab-api';
export type { TabApiConfig } from './lib/provide-tab-api';
