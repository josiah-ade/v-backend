import { CurrentUser } from '@/decorators/current-user.decorator';
import { ApiAuth, ApiPublic } from '@/decorators/http.decorators';
import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginReqDto } from './dto/login.req.dto';
import { LoginResDto } from './dto/login.res.dto';
import { RefreshResDto } from './dto/refresh.res.dto';
import { RegisterReqDto } from './dto/register.req.dto';
import { RegisterResDto } from './dto/register.res.dto';
import { JwtPayloadType } from './types/jwt-payload.type';

@ApiTags('auth')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiPublic({
    type: LoginResDto,
    summary: 'Sign in',
  })
  @Post('email/login')
  async signIn(
    @Body() userLogin: LoginReqDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResDto> {
    return await this.authService.signIn(userLogin, res);
  }

  @ApiPublic({
    type: RegisterResDto,
    summary: 'Register new user',
  })
  @Post('email/register')
  async register(
    @Body() dto: RegisterReqDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RegisterResDto> {
    return await this.authService.register(dto, res);
  }

  @ApiAuth({
    summary: 'Logout',
    errorResponses: [400, 401, 403, 500],
  })
  @Post('logout')
  async logout(@CurrentUser() userToken: JwtPayloadType): Promise<void> {
    await this.authService.logout(userToken);
  }

  @ApiPublic({
    type: RefreshResDto,
    summary: 'Refresh token',
  })
  @Get('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RefreshResDto> {
    return await this.authService.refreshToken(req, res);
  }

  @ApiPublic()
  @Post('forgot-password')
  async forgotPassword() {
    return 'forgot-password';
  }

  @ApiPublic()
  @Post('verify/forgot-password')
  async verifyForgotPassword() {
    return 'verify-forgot-password';
  }

  @ApiPublic()
  @Post('reset-password')
  async resetPassword() {
    return 'reset-password';
  }

  @ApiPublic()
  @Get('verify/email')
  async verifyEmail() {
    return 'verify-email';
  }

  @ApiPublic()
  @Post('verify/email/resend')
  async resendVerifyEmail() {
    return 'resend-verify-email';
  }
}
