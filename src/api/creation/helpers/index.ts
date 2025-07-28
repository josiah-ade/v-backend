import { buildnotFoundMessage } from '@/utils/response-builder.utils';
import { plainToInstance } from 'class-transformer';
import { CreationResDto } from '../dto/creation.res.dto';

export function buildEmptyCreationResponse(message: string): CreationResDto {
  const payload = {
    id: null,
    title: null,
    type: null,
    content: null,
    image: null,
    ...buildnotFoundMessage(message),
  };

  return plainToInstance(CreationResDto, payload);
}
