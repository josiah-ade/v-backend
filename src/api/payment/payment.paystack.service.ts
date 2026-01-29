import { SuccessResDto } from '@/common/dto/success.dto';
import { AllConfigType } from '@/config/config.type';
import { apiRoute } from '@/constants/api/api.route';
import { SYSTEM_USER_ID } from '@/constants/app.constant';
import { ErrorCode } from '@/constants/error-code.constant';
import { PaymentProvider } from '@/constants/modules/payments/enums/payments';
import { SubscriptionStatus } from '@/constants/modules/subscritions/enums/subscription';
import { ReferenceGenerator } from '@/decorators/generators/reference.generators';
import { ValidationException } from '@/exceptions/validation.exception';
import { calculateEndDate } from '@/utils/date/subscription-date.utils';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm/repository/Repository';
import { SubscriptionPlanEntity } from '../subscription/entities/subscription-plan.entity';
import { SubscriptionEntity } from '../subscription/entities/subscription.entity';
import { SubscriptionService } from '../subscription/subscription.sevice';
import { UserEntity } from '../user/entities/user.entity';
import { PaymentEntity } from './entities/payment.entity';

@Injectable()
export class PaystackPaymentService {
  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly httpService: HttpService,
    @InjectRepository(PaymentEntity)
    private readonly paymentRepository: Repository<PaymentEntity>,
    @InjectRepository(SubscriptionEntity)
    private readonly subscriptionRepository: Repository<SubscriptionEntity>,
    @InjectRepository(SubscriptionPlanEntity)
    private readonly subscriptionPlanRepository: Repository<SubscriptionPlanEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  async verifyPaystackPayment(reference: string): Promise<SuccessResDto> {
    if (!reference) throw new ValidationException(ErrorCode.P001);

    const verificationData = await this.verifyWithPaystack(reference);

    this.ensurePaymentSuccess(verificationData);

    const alreadyProcessed = await this.isPaymentProcessed(
      verificationData.data.reference,
    );

    if (!alreadyProcessed) {
      await this.processNewPayment(verificationData);
    }

    return { success: true, message: 'Payment verified successfully' };
  }

  private async verifyWithPaystack(reference: string) {
    const res = await this.paystackPaymentVerification(reference);
    return res.data;
  }

  private ensurePaymentSuccess(data: any) {
    if (!data.status || data.data.status !== 'success') {
      throw new ValidationException(ErrorCode.P002);
    }
  }

  private async isPaymentProcessed(providerRef: string): Promise<boolean> {
    return !!(await this.paymentRepository.findOne({
      where: { providerReference: providerRef },
    }));
  }

  private async paystackPaymentVerification(reference: string) {
    try {
      const paystackSecretkey = this.configService.getOrThrow(
        'payment.paystackSecretKey',
        {
          infer: true,
        },
      );

      const response = await firstValueFrom(
        this.httpService.get(apiRoute.PAYSTACK_VERIFY_PAYMENT + reference, {
          headers: {
            Authorization: `Bearer ${paystackSecretkey}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.log(error.response?.data.message);
      throw new ValidationException(
        ErrorCode.S001,
        error.response?.data.message,
      );
    }
  }

  private async processNewPayment(verificationData: any) {
    const meta = verificationData.data.metadata ?? {};
    const user = meta.user_id
      ? await this.userRepository.findOneBy({ id: meta.user_id })
      : null;

    const subscription = await this.createSubscriptionIfNeeded(meta, user);

    const payment = this.createPaymentEntity(
      verificationData,
      meta,
      user,
      subscription,
    );

    await this.paymentRepository.save(payment);
  }

  private async createSubscriptionIfNeeded(
    meta: any,
    user?: UserEntity | null,
  ) {
    if (
      meta.type !== 'recurring' ||
      !meta.user_id ||
      !meta.plan_code ||
      !meta.plan_duration
    ) {
      return null;
    }

    const plan = await this.subscriptionPlanRepository.findOneByOrFail({
      code: meta.plan_code,
    });

    await this.subscriptionService.expireActiveSubscriptions(meta.user_id);

    const startDate = new Date();
    const subscription = this.subscriptionRepository.create({
      userId: meta.user_id,
      user: user ?? undefined,
      planId: plan.id,
      plan: plan ?? undefined,
      planCode: meta.plan_code,
      planName: meta.title,
      planDuration: meta.plan_duration,
      status: SubscriptionStatus.ACTIVE,
      startDate: startDate,
      endDate: calculateEndDate(startDate, meta.plan_duration),
      autoRenew: true,
      createdBy: SYSTEM_USER_ID,
      updatedBy: SYSTEM_USER_ID,
    });

    return this.subscriptionRepository.save(subscription);
  }

  private createPaymentEntity(
    verificationData: any,
    meta: any,
    user?: UserEntity | null,
    subscription?: SubscriptionEntity | null,
  ) {
    return this.paymentRepository.create({
      email: verificationData.data.customer.email,
      fullName: user?.fullName || 'Guest',
      userId: user?.id ?? undefined,
      user: user ?? undefined,
      subscriptionId: subscription?.id ?? null,
      subscription: subscription ?? undefined,
      planCode: meta.plan_code ?? undefined,
      amount: verificationData.data.amount / 100,
      fee: (verificationData.data.fees ?? 0) / 100,
      currency: verificationData.data.currency,
      providerReference: verificationData.data.reference,
      reference: ReferenceGenerator.generate(),
      provider: PaymentProvider.PAYSTACK,
      channel: verificationData.data.channel,
      planType: meta.type || 'one-time',
      planDuration: meta.plan_duration || null,
      planName: meta.title || null,
      status: 'success',
      paidAt: new Date(verificationData.data.paid_at),
      log: verificationData.data.log,
      plan: verificationData.data.plan_object,
      authorization: verificationData.data.authorization,
      ipAddress: verificationData.data.ip_address,
      createdBy: SYSTEM_USER_ID,
      updatedBy: SYSTEM_USER_ID,
    });
  }
}
