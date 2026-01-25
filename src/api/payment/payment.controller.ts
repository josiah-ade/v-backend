import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaymentService } from './payment.service';

@ApiTags('payment')
@Controller({
  path: 'payment',
  version: '1',
})
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}
}
