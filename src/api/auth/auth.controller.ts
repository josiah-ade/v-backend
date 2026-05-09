import { CurrentUser } from '@/decorators/current-user.decorator';
import { ApiAuth, ApiPublic } from '@/decorators/http.decorators';
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginReqDto } from './dto/login.req.dto';
import { LoginResDto } from './dto/login.res.dto';
import { RefreshResDto } from './dto/refresh.res.dto';
import { RegisterReqDto } from './dto/register.req.dto';
import { RegisterResDto } from './dto/register.res.dto';
import { SocialResDto } from './dto/social.login.req.dto';
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

  // 1. Frontend redirects user here to start Google login
  @ApiPublic({
    summary: 'Google Login',
  })
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleLogin() {}

  // 2. Google redirects back here after user approves
  @ApiPublic({
    summary: 'Google Login Callback',
  })
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const data = await this.authService.socialLogin(
      req.user as SocialResDto,
      'google',
      res,
    );
    res.redirect(
      `${process.env.APP_CALLBACK_URL_FRONT}?accessToken=${data.accessToken}&tokenExpires=${data.tokenExpires}`,
    );
  }

  // 1. Frontend redirects user here to start Facebook login
  @Get('facebook')
  @ApiPublic({ summary: 'Facebook Login' })
  @UseGuards(AuthGuard('facebook'))
  async facebookLogin() {}

  // 2. Frontend redirects user here after user approves Facebook login
  @Get('facebook/callback')
  @ApiPublic({ summary: 'Facebook Callback' })
  @UseGuards(AuthGuard('facebook'))
  async facebookCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as SocialResDto;
    const data = await this.authService.socialLogin(user, 'facebook', res);
    res.redirect(
      `${process.env.APP_CALLBACK_URL_FRONT}?accessToken=${data.accessToken}&tokenExpires=${data.tokenExpires}`,
    );
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
