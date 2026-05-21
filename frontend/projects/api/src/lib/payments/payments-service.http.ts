import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../common/api-base-url.token';
import { CreatePaymentRequest } from './create-payment-request.interface';
import { PaymentIn } from './payment-in.interface';
import { IPaymentsService } from './payments-service.interface';

@Injectable()
export class PaymentsServiceHttp implements IPaymentsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  create(request: CreatePaymentRequest): Promise<PaymentIn> {
    return firstValueFrom(this.http.post<PaymentIn>(`${this.baseUrl}/payments`, request));
  }
}
