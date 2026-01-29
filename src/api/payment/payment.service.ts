import { SuccessResponse } from '@/common/dto/success.dto';
import { transformDto } from '@/utils/transformers/transform-dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm/repository/Repository';
import { PaymentResDto } from './dto/get-payment.res.dto';
import { PaymentEntity } from './entities/payment.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(PaymentEntity)
    private readonly paymentRepository: Repository<PaymentEntity>,
  ) {}

  async getAllPayments(): Promise<SuccessResponse<PaymentResDto[]>> {
    const payments = await this.paymentRepository.find();

    return transformDto(
      PaymentResDto,
      payments,
      `${payments.length ? 'Payments fetched successfully.' : 'No payments found.'}`,
    );
  }
}
