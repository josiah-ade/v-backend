import { Module } from '@nestjs/common';
import { AiModule } from './ai/ai.module';
import { AuthModule } from './auth/auth.module';
import { AvatarModule } from './avatar/avatar.module';
import { CreationModule } from './creation/creation.module';
import { FavouriteModule } from './favourite/favourite.module';
import { HealthModule } from './health/health.module';
import { HomeModule } from './home/home.module';
import { BidModule } from './market-place/bid/bid.module';
import { ChatModule } from './market-place/chat/chat.module';
import { ProductModule } from './market-place/product/product.module';
import { PostModule } from './post/post.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    UserModule,
    HealthModule,
    AuthModule,
    HomeModule,
    PostModule,
    FavouriteModule,
    AvatarModule,
    AiModule,
    CreationModule,
    ProductModule,
    ChatModule,
    BidModule,
  ],
})
export class ApiModule {}
