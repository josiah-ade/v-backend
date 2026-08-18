import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { ResumeEntity } from './entities/resume.entity';
import { ResumeController } from './resume.controller';
import { ResumeService } from './resume.service';
import { ResumeExportService } from './resumeExport.service';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([ResumeEntity, UserEntity])],
  controllers: [ResumeController],
  providers: [ResumeService, ResumeExportService],
  exports: [ResumeService,ResumeExportService],
})
export class ResumeModule {}
