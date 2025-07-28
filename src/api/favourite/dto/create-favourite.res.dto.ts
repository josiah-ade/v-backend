import { SuccessResDto } from '@/common/dto/success.dto';
import { Exclude } from 'class-transformer';

@Exclude()
export class CreateFavouriteResDto extends SuccessResDto{}
