import { SuccessResDto, SuccessResponse } from '@/common/dto/success.dto';
import { Uuid } from '@/common/types/common.type';
import { CurrentUser } from '@/decorators/current-user.decorator';
import { ApiAuth, ApiPublic } from '@/decorators/http.decorators';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { CreateSubscriptionPlanReqDto } from './dto/create-subscription-plans.req.dto';
import { SubscriptionPlanResDto } from './dto/get-subscription-plans.res.dto';
import { SubscriptionService } from './subscription.sevice';
import { SubscriptionResDto } from './dto/get-subscription-status.res.dto';

@ApiTags('subscriptions')
@Controller({
  path: 'subscriptions',
  version: '1',
})
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @ApiPublic({
    type: SuccessResponse<SubscriptionPlanResDto>,
    summary: 'Fetch subscription plans',
  })
  @Get('plans')
  async getSubscriptionPlans(): Promise<
    SuccessResponse<SubscriptionPlanResDto[]>
  > {
    return this.subscriptionService.getSubscriptionPlans();
  }

  @ApiPublic({
    type: SuccessResponse<SubscriptionPlanResDto>,
    summary: 'Fetch subscription plan',
  })
  @Get('plan/:id')
  async getSubscriptionPlan(
    @Param('id', ParseUUIDPipe) id: Uuid,
  ): Promise<SuccessResponse<SubscriptionPlanResDto>> {
    return this.subscriptionService.getSubscriptionPlan(id);
  }

  @ApiAuth({
    type: SuccessResDto,
    summary: 'Create subscription plan',
  })
  @Post('plan/create')
  async createSubscriptionPlan(
    @CurrentUser('userId') userId: Uuid,
    @Body() dto: CreateSubscriptionPlanReqDto,
  ): Promise<SuccessResDto> {
    return this.subscriptionService.createSubscriptionPlan(userId, dto);
  }

  @ApiAuth({
    type: SuccessResDto,
    summary: 'Delete subscription plans',
  })
  @ApiParam({ name: 'id', type: 'String' })
  @Delete('plan/delete/:id')
  async deleteSubscriptionPlans(
    @Param('id', ParseUUIDPipe) id: Uuid,
    @CurrentUser('userId') userId: Uuid,
  ): Promise<SuccessResDto> {
    return this.subscriptionService.deleteSubscriptionPlans(id, userId);
  }

  @ApiAuth({
    type: SuccessResponse<SubscriptionResDto>,
    summary: 'Get subscription status',
  })
  @ApiParam({ name: 'id', type: 'String' })
  @Get('plan/status/:id')
  async getSubscriptionStatus(
    @Param('id', ParseUUIDPipe) id: Uuid,
  ): Promise<SuccessResponse<SubscriptionResDto>> {
    return this.subscriptionService.getSubscriptionStatus(id);
  }
}
