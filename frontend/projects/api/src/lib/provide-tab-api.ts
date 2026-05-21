import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { EnvironmentProviders, Provider, makeEnvironmentProviders } from '@angular/core';
import { provideAuthService } from './auth/provide-auth-service';
import { provideBalanceService } from './balance/provide-balance-service';
import { provideBillsService } from './bills/provide-bills-service';
import { API_BASE_URL } from './common/api-base-url.token';
import { provideCounterpartyService } from './counterparty/provide-counterparty-service';
import { provideDashboardService } from './dashboard/provide-dashboard-service';
import { provideExportService } from './export/provide-export-service';
import { authInterceptor } from './http/auth.interceptor';
import { correlationIdInterceptor } from './http/correlation-id.interceptor';
import { problemDetailsInterceptor } from './http/problem-details.interceptor';
import { provideLoansService } from './ledger/provide-loans-service';
import { provideMeService } from './me/provide-me-service';
import { providePaymentsService } from './payments/provide-payments-service';
import { providePreferencesService } from './preferences/provide-preferences-service';
import { provideStatementService } from './statement/provide-statement-service';

export interface TabApiConfig {
  readonly baseUrl: string;
}

/**
 * Single entry point that wires every api-library token to its default HTTP
 * implementation and installs the auth / correlation-id / problem-details
 * interceptors. The `tab` application calls this from `app.config.ts`.
 */
export function provideTabApi(config: TabApiConfig): EnvironmentProviders {
  const providers: (Provider | EnvironmentProviders)[] = [
    { provide: API_BASE_URL, useValue: config.baseUrl },
    provideHttpClient(
      withInterceptors([
        correlationIdInterceptor,
        authInterceptor,
        problemDetailsInterceptor,
      ]),
    ),
    ...provideAuthService(),
    ...provideMeService(),
    ...provideCounterpartyService(),
    ...provideBalanceService(),
    ...provideDashboardService(),
    ...provideLoansService(),
    ...provideBillsService(),
    ...providePaymentsService(),
    ...provideStatementService(),
    ...providePreferencesService(),
    ...provideExportService(),
  ];
  return makeEnvironmentProviders(providers);
}
