import { AllConfigType } from '@/config/config.type';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private configService: ConfigService<AllConfigType>) {
    super({
      clientID: configService.getOrThrow('auth.FacebookClientID', {
        infer: true,
      }),
      clientSecret: configService.getOrThrow('auth.FacebookClientSecret', {
        infer: true,
      }),
      callbackURL: configService.getOrThrow('app.facebookCallbackUrl', {
        infer: true,
      }),
      scope: ['email', 'public_profile'],
      profileFields: ['id', 'emails', 'name', 'picture'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, user: any) => void,
  ) {
    const { name, emails, photos, id } = profile;
    const user = {
      socialId: id,
      email: emails?.[0]?.value,
      fullName: `${profile.name?.givenName} ${profile.name?.familyName}`,
      firstName: name?.givenName,
      lastName: name?.familyName,
      picture: photos?.[0]?.value,
      accessToken,
    };
    done(null, user);
  }
}
