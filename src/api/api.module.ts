import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { HomeModule } from './home/home.module';
import { PostModule } from './post/post.module';
import { UserModule } from './user/user.module';
import { FavouriteModule } from './favourite/favourite.module';

@Module({
  imports: [UserModule, HealthModule, AuthModule, HomeModule, PostModule, FavouriteModule],
})
export class ApiModule {}
