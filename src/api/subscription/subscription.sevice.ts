import { SuccessResDto, SuccessResponse } from '@/common/dto/success.dto';
import { Uuid } from '@/common/types/common.type';
import { AllConfigType } from '@/config/config.type';
import { apiRoute } from '@/constants/api/api.route';
import { SYSTEM_USER_ID } from '@/constants/app.constant';
import { ErrorCode } from '@/constants/error-code.constant';
import { SubscriptionStatus } from '@/constants/modules/subscritions/enums/subscription';
import { CreatePlanInput } from '@/constants/modules/subscritions/interfaces/subscription';
import {
  NotFoundAppException,
  ValidationException,
} from '@/exceptions/validation.exception';
import { buildSuccessMessage } from '@/utils/response-builder.utils';
import {
  transformDto,
  transformSingleDto,
  transformSingleEmptyDto,
} from '@/utils/transformers/transform-dto';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { LessThan } from 'typeorm/find-options/operator/LessThan';
import { LessThanOrEqual } from 'typeorm/find-options/operator/LessThanOrEqual';
import { MoreThan } from 'typeorm/find-options/operator/MoreThan';
import { Not } from 'typeorm/find-options/operator/Not';
import { Repository } from 'typeorm/repository/Repository';
import { CreateSubscriptionPlanReqDto } from './dto/create-subscription-plans.req.dto';
import { AllSubscriptionResDto } from './dto/get-all-subscription.res.dto';
import { SubscriptionPlanResDto } from './dto/get-subscription-plans.res.dto';
import { SubscriptionResDto } from './dto/get-subscription-status.res.dto';
import { SubscriptionPlanEntity } from './entities/subscription-plan.entity';
import { SubscriptionEntity } from './entities/subscription.entity';

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly httpService: HttpService,
    @InjectRepository(SubscriptionEntity)
    private readonly subscriptionRepository: Repository<SubscriptionEntity>,
    @InjectRepository(SubscriptionPlanEntity)
    private readonly subscriptionPlanRepository: Repository<SubscriptionPlanEntity>,
  ) {}

  async getSubscriptionPlans(): Promise<
    SuccessResponse<SubscriptionPlanResDto[]>
  > {
    const subscriptionPlans = await this.subscriptionPlanRepository.find({
      order: { price: 'ASC' },
    });

    return transformDto(
      SubscriptionPlanResDto,
      subscriptionPlans,
      `${subscriptionPlans.length ? 'Subscription plans fetched successfully.' : 'No subscription plans.'}`,
    );
  }

  async getSubscriptionPlan(
    id: Uuid,
  ): Promise<SuccessResponse<SubscriptionPlanResDto>> {
    if (!id) throw new ValidationException(ErrorCode.R000);

    const subscriptionPlan = await this.subscriptionPlanRepository.findOneBy({
      id,
    });

    if (!subscriptionPlan)
      throw new NotFoundAppException(
        ErrorCode.I002,
        'Subscription plan not found',
      );

    return transformSingleDto(
      SubscriptionPlanResDto,
      subscriptionPlan,
      'subscription plan fetched successfully.',
    );
  }

  async createSubscriptionPlan(
    userId: Uuid,
    dto: CreateSubscriptionPlanReqDto,
  ): Promise<SuccessResDto> {
    if (!userId) throw new ValidationException(ErrorCode.E002);

    let planCode: string | undefined = undefined;
    let sendInvoices = false;
    let sendSms = false;

    if (!dto.isOneTime) {
      const paystackResponse = await this.createPaystackPlan({
        name: dto.title,
        interval: dto.billingCycle,
        amount: dto.price * 100,
        description: dto.description,
        currency: dto.currency,
      });

      // console.log(paystackResponse.data);
      planCode = paystackResponse.data.data.plan_code;
      sendInvoices = paystackResponse.data.data.send_invoices;
      sendSms = paystackResponse.data.data.send_sms;
    }

    const mergePlans = {
      ...dto,
      code: planCode,
      sendInvoices,
      sendSms,
      createdBy: SYSTEM_USER_ID,
      updatedBy: SYSTEM_USER_ID,
    };

    // console.log(mergePlans);

    const plan = this.subscriptionPlanRepository.create(mergePlans);
    await this.subscriptionPlanRepository.save(plan);

    return transformSingleEmptyDto(
      SuccessResDto,
      buildSuccessMessage('subscription plan created successfully.'),
    );
  }

  async deleteSubscriptionPlans(
    id: Uuid,
    userId: Uuid,
  ): Promise<SuccessResDto> {
    if (!userId) throw new ValidationException(ErrorCode.E002);
    if (!id) throw new ValidationException(ErrorCode.R000);

    const plan = await this.subscriptionPlanRepository.findOneBy({
      id,
    });
    if (!plan) throw new NotFoundAppException(ErrorCode.I002);

    await this.subscriptionPlanRepository.remove(plan);

    return transformSingleEmptyDto(
      SuccessResDto,
      buildSuccessMessage('subscription plan deleted successfully.'),
    );
  }

  async getAllSubscriptions(
    id: Uuid,
  ): Promise<SuccessResponse<AllSubscriptionResDto[]>> {
    if (!id) throw new ValidationException(ErrorCode.R000);

    await this.expireSubscriptionsIfNeeded(id);

    const plan = await this.subscriptionRepository.find({
      where: {
        userId: id,
      },
      order: {
        id: 'DESC',
      },
      relations: ['plan'],
    });

    console.log(plan);
    return transformDto(
      AllSubscriptionResDto,
      plan,
      `${plan.length ? 'Subscriptions fetched successfully.' : 'No subscriptions found.'}`,
    );
  }

  async getSubscriptionStatus(
    id: Uuid,
  ): Promise<SuccessResponse<SubscriptionResDto>> {
    if (!id) throw new ValidationException(ErrorCode.R000);

    await this.expireSubscriptionsIfNeeded(id);

    const now = new Date();

    const plan = await this.subscriptionRepository.findOne({
      where: {
        userId: id,
        startDate: LessThanOrEqual(now),
        endDate: MoreThan(now),
        status: SubscriptionStatus.ACTIVE,
      },
      order: {
        endDate: 'DESC',
      },
    });

    return transformSingleDto(
      SubscriptionResDto,
      plan,
      `${plan ? 'Subscription fetched successfully.' : 'No active subscription.'}`,
    );
  }

  async expireActiveSubscriptions(userId: Uuid): Promise<void> {
    const now = new Date();

    await this.subscriptionRepository.update(
      {
        userId,
        status: SubscriptionStatus.ACTIVE,
        endDate: MoreThan(now),
      },
      {
        status: SubscriptionStatus.EXPIRED,
        expiredAt: now,
      },
    );
  }

  private async expireSubscriptionsIfNeeded(userId: Uuid): Promise<void> {
    const now = new Date();

    await this.subscriptionRepository.update(
      {
        userId,
        endDate: LessThan(now),
        status: Not(SubscriptionStatus.EXPIRED),
      },
      {
        status: SubscriptionStatus.EXPIRED,
        expiredAt: now,
      },
    );
  }

  private async createPaystackPlan({
    name,
    interval,
    amount,
    description,
    currency = 'NGN',
  }: CreatePlanInput) {
    try {
      const paystackSecretkey = this.configService.getOrThrow(
        'payment.paystackSecretKey',
        {
          infer: true,
        },
      );

      const response = await firstValueFrom(
        this.httpService.post(
          apiRoute.PAYSTACK_CREATE_PLAN,
          {
            name,
            interval,
            amount,
            currency,
            description,
          },
          {
            headers: {
              Authorization: `Bearer ${paystackSecretkey}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.log(error);
      throw new ValidationException(ErrorCode.S001);
    }
  }
}
