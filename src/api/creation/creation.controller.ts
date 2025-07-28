import { OffsetPaginatedDto } from '@/common/dto/offset-pagination/paginated.dto';
import { Uuid } from '@/common/types/common.type';
import { CurrentUser } from '@/decorators/current-user.decorator';
import { ApiAuth } from '@/decorators/http.decorators';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { CreationService } from './creation.service';
import { AddCreationReqDto } from './dto/add-creation.req.dto';
import { CreationResDto } from './dto/creation.res.dto';
import { DeleteCreationRes } from './dto/delete-creation.res.dto';
import { ListCreationReqDto } from './dto/list-creation.req.dto';
import { RenameCreationReqDto } from './dto/rename-creation.req.dto';
import { RenameCreationResDto } from './dto/rename-creation.res.dto';

@ApiTags('creation')
@Controller({
  path: 'creation',
  version: '1',
})
export class CreationController {
  constructor(private readonly creationService: CreationService) {}

  @Get()
  @ApiAuth({
    type: CreationResDto,
    summary: 'Get All Creations',
  })
  async getCreations(
    @Query() reqDto: ListCreationReqDto,
    @CurrentUser('id') userId: Uuid,
  ): Promise<OffsetPaginatedDto<CreationResDto>> {
    return this.creationService.getCreations(reqDto, userId);
  }

  @Get('/latest')
  @ApiAuth({
    type: CreationResDto,
    summary: 'Get Latest Creation',
  })
  async getLatestCreation(
    @CurrentUser('id') userId: Uuid,
  ): Promise<CreationResDto> {
    return this.creationService.getLatestCreation(userId);
  }

  @Post('/create')
  @ApiAuth({
    type: CreationResDto,
    summary: 'Create New Creation Design',
  })
  async addNewCreation(
    @Body() reqDto: AddCreationReqDto,
    @CurrentUser('id') userId: Uuid,
  ): Promise<CreationResDto> {
    return this.creationService.addNewCreation(reqDto, userId);
  }

  @Post('/rename-creation')
  @ApiAuth({ type: RenameCreationResDto, summary: 'Update title' })
  @ApiParam({ name: 'id', type: 'String' })
  async updateUser(
    @Body() reqDto: RenameCreationReqDto,
    @CurrentUser('id') userId: Uuid,
  ) {
    return this.creationService.renameCreation(reqDto, userId);
  }

  @Delete('/delete/:id')
  @ApiAuth({
    summary: 'Delete creation',
  })
  @ApiParam({ name: 'id', type: 'String' })
  async delete(
    @Param('id', ParseUUIDPipe) id: Uuid,
    @CurrentUser('id') userId: Uuid,
  ): Promise<DeleteCreationRes> {
    return this.creationService.deleteCreation(id, userId);
  }
}
