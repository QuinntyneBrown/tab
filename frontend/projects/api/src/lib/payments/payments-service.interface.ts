import { CreatePaymentRequest } from './create-payment-request.interface';
import { PaymentIn } from './payment-in.interface';

export interface IPaymentsService {
  create(request: CreatePaymentRequest): Promise<PaymentIn>;
}
