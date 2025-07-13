import { Injectable } from '@nestjs/common';
import { Response } from 'express';

@Injectable()
export class AuthCookieService {
  setRefreshTokenCookie(res: Response, token: string, expiresIn: number): void {
    res.cookie('refreshToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: expiresIn,
      path: '/', // or restrict to /auth/refresh if you want
    });
  }

  clearRefreshTokenCookie(res: Response): void {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
  }
}
