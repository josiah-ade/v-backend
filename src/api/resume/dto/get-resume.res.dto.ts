import { Exclude, Expose, Type } from 'class-transformer';
import { CreateCVDto } from './create-resume.res.dto';

@Exclude()
export class GetResumeResDto {

  @Expose()
  @Type(() => CreateCVDto)
  cvData!: CreateCVDto;
}
