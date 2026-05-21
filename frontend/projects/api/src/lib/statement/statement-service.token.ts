import { InjectionToken } from '@angular/core';
import { IStatementService } from './statement-service.interface';

export const STATEMENT_SERVICE = new InjectionToken<IStatementService>('STATEMENT_SERVICE');
