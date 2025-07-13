import { Module } from '@nestjs/common';
import { FavouriteController } from './favourite.controller';
import { FavouriteService } from './favourite.services';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavouriteEntity } from './entities/favourite.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FavouriteEntity])],
  controllers: [FavouriteController],
  providers: [FavouriteService],
  exports: [FavouriteService],
})
export class FavouriteModule {}
