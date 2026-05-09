// auth/strategies/google.strategy.ts
import { AllConfigType } from '@/config/config.type';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService<AllConfigType>) {
    super({
      clientID: configService.getOrThrow('auth.GoogleClientID', {
        infer: true,
      }),
      clientSecret: configService.getOrThrow('auth.GoogleClientSecret', {
        infer: true,
      }),
      callbackURL: configService.getOrThrow('app.googleCallbackUrl', {
        infer: true,
      }),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    const { name, emails, photos } = profile;

    const user = {
      socialId: profile.id,
      email: emails[0].value,
      fullName: `${profile.name?.givenName} ${profile.name?.familyName}`,
      firstName: name?.givenName,
      lastName: name?.familyName,
      picture: photos?.[0]?.value,
      accessToken,
    };

    console.log(user);

    done(null, user);
  }
}
