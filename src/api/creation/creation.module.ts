import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvatarEntity } from '../avatar/entities/avatar.entity';
import { CreationController } from './creation.controller';
import { CreationService } from './creation.service';
import { CreationEntity } from './entities/creation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CreationEntity, AvatarEntity])],
  controllers: [CreationController],
  providers: [CreationService],
  exports: [CreationService],
})
export class CreationModule {}
