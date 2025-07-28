import { ClassConstructor, plainToInstance } from 'class-transformer';

export function transformDto<T>(cls: ClassConstructor<T>, data: object[]): T[] {
  const transformed = plainToInstance(cls, JSON.parse(JSON.stringify(data)), {
    excludeExtraneousValues: true,
  }); 

  return transformed as T[];
}

export function transformSingleDto<T>(
  cls: ClassConstructor<T>,
  data: object,
): T {
  const transformed = plainToInstance(cls, JSON.parse(JSON.stringify(data)), {
    excludeExtraneousValues: true,
  });

  return transformed as T;
}
