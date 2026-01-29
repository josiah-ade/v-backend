import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionPlanEntity } from '../subscription/entities/subscription-plan.entity';
import { SubscriptionEntity } from '../subscription/entities/subscription.entity';
import { SubscriptionService } from '../subscription/subscription.sevice';
import { UserEntity } from '../user/entities/user.entity';
import { PaymentEntity } from './entities/payment.entity';
import { PaymentController } from './payment.controller';
import { PaystackPaymentService } from './payment.paystack.service';
import { PaymentService } from './payment.service';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([
      PaymentEntity,
      SubscriptionEntity,
      UserEntity,
      SubscriptionPlanEntity,
    ]),
  ],
  controllers: [PaymentController],
  providers: [PaystackPaymentService, PaymentService, SubscriptionService],
  exports: [PaystackPaymentService, PaymentService, SubscriptionService],
})
export class PaymentModule {}
