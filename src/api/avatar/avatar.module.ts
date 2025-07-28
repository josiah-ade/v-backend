import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvatarController } from './avatar.controller';
import { AvatarService } from './avatar.services';
import { AvatarEntity } from './entities/avatar.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AvatarEntity])],
  controllers: [AvatarController],
  providers: [AvatarService],
  exports: [AvatarService],
})
export class AvatarModule {}
