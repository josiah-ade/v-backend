import { OffsetPaginationDto } from '@/common/dto/offset-pagination/offset-pagination.dto';
import { PageOptionsDto } from '@/common/dto/offset-pagination/page-options.dto';
import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

export async function paginate<T>(
  builder: SelectQueryBuilder<T>,
  pageOptionsDto: PageOptionsDto,
  options?: Partial<{
    skipCount: boolean;
    takeAll: boolean;
  }>,
): Promise<[T[], OffsetPaginationDto]> {
  if (!options?.takeAll) {
    builder.skip(pageOptionsDto.offset).take(pageOptionsDto.limit);
  }

  const entities: T[] = await builder.getMany();

  let count = -1;

  if (!options?.skipCount) {
    count = await builder.getCount();
  }

  const metaDto = new OffsetPaginationDto(count, pageOptionsDto);

  return [entities, metaDto];
}

// export async function paginateJoin<T>(
//   builder: SelectQueryBuilder<T>,
//   pageOptionsDto: PageOptionsDto,
//   options?: Partial<{ skipCount: boolean; takeAll: boolean }>,
// ): Promise<[T[], OffsetPaginationDto]> {
//   if (!options?.takeAll) {
//     builder.skip(pageOptionsDto.offset).take(pageOptionsDto.limit || 20);
//   }

//   const rawResults: T[] = await builder.getRawMany();

//   let count = -1;

//   if (!options?.skipCount) {
//     count = await builder.getCount();
//   }

//   const metaDto = new OffsetPaginationDto(count, pageOptionsDto);

//   return [rawResults, metaDto];
// }

export async function paginateJoin<T extends ObjectLiteral = any>(
  builder: SelectQueryBuilder<T>,
  pageOptionsDto: PageOptionsDto,
  options: Partial<{ skipCount: boolean; takeAll: boolean }> = {},
): Promise<[T[], OffsetPaginationDto]> {
  if (!options.takeAll) {
    builder.skip(pageOptionsDto.offset).take(pageOptionsDto.limit || 50);
  }

  // hydrate both entities and raw alias fields
  const { entities, raw } = await builder.getRawAndEntities();

  // merge entity fields + raw alias fields
  const merged = entities.map((ent, i) => ({
    ...(ent as any),
    ...(raw[i] || {}),
  })) as T[];

  // count
  let count = -1;
  if (!options.skipCount) {
    count = await builder.getCount();
  }

  // construct your class-based pagination dto
  const metaDto = new OffsetPaginationDto(count, pageOptionsDto);

  return [merged, metaDto];
}
