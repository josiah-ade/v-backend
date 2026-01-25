import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionPlanEntity } from './entities/subscription-plan.entity';
import { SubscriptionEntity } from './entities/subscription.entity';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.sevice';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([SubscriptionEntity, SubscriptionPlanEntity]),
  ],
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
