import { SuccessResDto, SuccessResponse } from '@/common/dto/success.dto';
import { ApiAuth, ApiPublic } from '@/decorators/http.decorators';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaymentResDto } from './dto/get-payment.res.dto';
import { PaystackVerifyReqDto } from './dto/paystack-verify.req.dto';
import { PaystackPaymentService } from './payment.paystack.service';
import { PaymentService } from './payment.service';

@ApiTags('payment')
@Controller({
  path: 'payment',
  version: '1',
})
export class PaymentController {
  constructor(
    private readonly paystackPaymentService: PaystackPaymentService,
    private readonly paymentService: PaymentService,
  ) {}

  @ApiPublic({
    type: SuccessResDto,
    summary: 'Paystack payment verification',
  })
  @Post('paystack/verify')
  async verifyPaystackPayment(
    @Body() dto: PaystackVerifyReqDto,
  ): Promise<SuccessResDto> {
    return this.paystackPaymentService.verifyPaystackPayment(dto.reference);
  }

  @ApiAuth({
    type: SuccessResponse<PaymentResDto[]>,
    summary: 'Get All payments',
  })
  @Get()
  async getAllPayments(): Promise<SuccessResponse<PaymentResDto[]>> {
    return this.paymentService.getAllPayments();
  }
}
