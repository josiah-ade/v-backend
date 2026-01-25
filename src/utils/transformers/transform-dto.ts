import { SuccessResponse } from '@/common/dto/success.dto';
import { ClassConstructor, plainToInstance } from 'class-transformer';

export function transformEmptyDto<T>(cls: ClassConstructor<T>, data: object[]): T[] {
  const transformed = plainToInstance(cls, JSON.parse(JSON.stringify(data)), {
    excludeExtraneousValues: true,
  });

  return transformed as T[];
}

export function transformSingleEmptyDto<T>(
  cls: ClassConstructor<T>,
  data: object,
): T {
  const transformed = plainToInstance(cls, JSON.parse(JSON.stringify(data)), {
    excludeExtraneousValues: true,
  });

  return transformed as T;
}

export function transformDto<T>(
  cls: ClassConstructor<T>,
  data: object[],
): SuccessResponse<T[]> {
  const transformed = plainToInstance(cls, JSON.parse(JSON.stringify(data)), {
    excludeExtraneousValues: true,
  });

  return {
    success: true,
    data: transformed as T[],
  };
}

export function transformSingleDto<T>(
  cls: ClassConstructor<T>,
  data: object,
): SuccessResponse<T> {
  const transformed = plainToInstance(cls, JSON.parse(JSON.stringify(data)), {
    excludeExtraneousValues: true,
  });

  return {
    success: true,
    data: transformed as T,
  };
}
