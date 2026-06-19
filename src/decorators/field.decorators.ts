import { Constructor } from '@/common/types/types';
import type { Type as ClassType } from '@nestjs/common';
import { applyDecorators } from '@nestjs/common';
import { ApiProperty, type ApiPropertyOptions } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsDefined,
  IsEmail,
  IsEnum,
  IsInt,
  IsJWT,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
  NotEquals,
  ValidateNested,
} from 'class-validator';
import { ToBoolean, ToLowerCase, ToUpperCase } from './transform.decorators';
import { IsNullable } from './validators/is-nullable.decorator';
import { IsPassword } from './validators/is-password.decorator';

interface IFieldOptions {
  each?: boolean;
  swagger?: boolean;
  nullable?: boolean;
  groups?: string[];
}

interface INumberFieldOptions extends IFieldOptions {
  min?: number;
  max?: number;
  int?: boolean;
  isPositive?: boolean;
}

interface IStringFieldOptions extends IFieldOptions {
  minLength?: number;
  maxLength?: number;
  toLowerCase?: boolean;
  toUpperCase?: boolean;
  allowEmpty?: boolean;
}

interface IEnumFieldOptions extends IFieldOptions {
  enumName?: string;
}

type IBooleanFieldOptions = IFieldOptions;
type ITokenFieldOptions = IFieldOptions;
type IClassFieldOptions = IFieldOptions;

export function NumberField(
  options: Omit<ApiPropertyOptions, 'type'> & INumberFieldOptions = {},
): PropertyDecorator {
  const decorators = [Type(() => Number)];

  if (options.nullable) {
    decorators.push(IsNullable({ each: options.each }));
  } else {
    decorators.push(NotEquals(null, { each: options.each }));
  }

  if (options.swagger !== false) {
    const { required = true, ...restOptions } = options;
    decorators.push(
      ApiProperty({ type: Number, required: !!required, ...restOptions }),
    );
  }

  if (options.int) {
    decorators.push(IsInt({ each: options.each }));
  } else {
    decorators.push(IsNumber({}, { each: options.each }));
  }

  if (typeof options.min === 'number') {
    decorators.push(Min(options.min, { each: options.each }));
  }

  if (typeof options.max === 'number') {
    decorators.push(Max(options.max, { each: options.each }));
  }

  if (options.isPositive) {
    decorators.push(IsPositive({ each: options.each }));
  }

  return applyDecorators(...decorators);
}

export function NumberFieldOptional(
  options: Omit<ApiPropertyOptions, 'type' | 'required'> &
    INumberFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(
    IsOptional({ each: options.each }),
    NumberField({ required: false, ...options }),
  );
}

export function TokenField(
  options: Omit<ApiPropertyOptions, 'type'> & ITokenFieldOptions = {},
): PropertyDecorator {
  const decorators = [Type(() => String), IsJWT({ each: options.each })];

  if (options.nullable) {
    decorators.push(IsNullable({ each: options.each }));
  } else {
    decorators.push(NotEquals(null, { each: options.each }));
  }

  if (options.swagger !== false) {
    const { required = true, ...restOptions } = options;
    decorators.push(
      ApiProperty({
        type: String,
        required: !!required,
        ...restOptions,
        isArray: options.each,
      }),
    );
  }

  return applyDecorators(...decorators);
}

export function StringFieldOptional(
  options: Omit<ApiPropertyOptions, 'type' | 'required'> &
    IStringFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(
    IsOptional({ each: options.each }),
    StringField({ required: false, ...options }),
  );
}

export function StringField(
  options: Omit<ApiPropertyOptions, 'type'> & IStringFieldOptions = {},
): PropertyDecorator {
  const decorators = [Type(() => String), IsString({ each: options.each })];

  if (options.nullable) {
    decorators.push(IsNullable({ each: options.each }));
  } else {
    decorators.push(NotEquals(null, { each: options.each }));
  }

  if (options.swagger !== false) {
    const { required = true, ...restOptions } = options;
    decorators.push(
      ApiProperty({
        type: String,
        required: !!required,
        ...restOptions,
        isArray: options.each,
      }),
    );
  }

  const minLength = options.minLength || 1;

  if (options.allowEmpty) {
    decorators.push(MinLength(0, { each: options.each }));
  } else {
    decorators.push(MinLength(minLength, { each: options.each }));
  }

  if (options.maxLength) {
    decorators.push(MaxLength(options.maxLength, { each: options.each }));
  }

  if (options.toLowerCase) {
    decorators.push(ToLowerCase());
  }

  if (options.toUpperCase) {
    decorators.push(ToUpperCase());
  }

  return applyDecorators(...decorators);
}

export function PasswordField(
  options: Omit<ApiPropertyOptions, 'type' | 'minLength'> &
    IStringFieldOptions = {},
): PropertyDecorator {
  const decorators = [StringField({ ...options, minLength: 6 }), IsPassword()];

  if (options.nullable) {
    decorators.push(IsNullable());
  } else {
    decorators.push(NotEquals(null));
  }

  return applyDecorators(...decorators);
}

export function PasswordFieldOptional(
  options: Omit<ApiPropertyOptions, 'type' | 'required' | 'minLength'> &
    IStringFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(
    IsOptional({ each: options.each }),
    PasswordField({ required: false, ...options }),
  );
}

export function BooleanField(
  options: Omit<ApiPropertyOptions, 'type'> & IBooleanFieldOptions = {},
): PropertyDecorator {
  const decorators = [ToBoolean(), IsBoolean()];

  if (options.nullable) {
    decorators.push(IsNullable());
  } else {
    decorators.push(NotEquals(null));
  }

  if (options.swagger !== false) {
    const { required = true, ...restOptions } = options;
    decorators.push(
      ApiProperty({ type: Boolean, required: !!required, ...restOptions }),
    );
  }

  return applyDecorators(...decorators);
}

export function BooleanFieldOptional(
  options: Omit<ApiPropertyOptions, 'type' | 'required'> &
    IBooleanFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(
    IsOptional({ each: options.each }),
    BooleanField({ required: false, ...options }),
  );
}

export function EmailField(
  options: Omit<ApiPropertyOptions, 'type'> & IStringFieldOptions = {},
): PropertyDecorator {
  const decorators = [
    IsEmail(),
    StringField({ toLowerCase: true, ...options }),
  ];

  if (options.nullable) {
    decorators.push(IsNullable());
  } else {
    decorators.push(NotEquals(null));
  }

  if (options.swagger !== false) {
    const { required = true, ...restOptions } = options;
    decorators.push(
      ApiProperty({ type: String, required: !!required, ...restOptions }),
    );
  }

  return applyDecorators(...decorators);
}

export function EmailFieldOptional(
  options: Omit<ApiPropertyOptions, 'type'> & IStringFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(
    IsOptional({ each: options.each }),
    EmailField({ required: false, ...options }),
  );
}

export function UUIDField(
  options: Omit<ApiPropertyOptions, 'type' | 'format' | 'isArray'> &
    IFieldOptions = {},
): PropertyDecorator {
  const decorators = [Type(() => String), IsUUID('4', { each: options.each })];

  if (options.nullable) {
    decorators.push(IsNullable());
  } else {
    decorators.push(NotEquals(null));
  }

  if (options.swagger !== false) {
    const { required = true, ...restOptions } = options;
    decorators.push(
      ApiProperty({
        type: options.each ? [String] : String,
        format: 'uuid',
        isArray: options.each,
        required: !!required,
        ...restOptions,
      }),
    );
  }

  return applyDecorators(...decorators);
}

export function UUIDFieldOptional(
  options: Omit<ApiPropertyOptions, 'type' | 'required' | 'isArray'> &
    IFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(
    IsOptional({ each: options.each }),
    UUIDField({ required: false, ...options }),
  );
}

export function URLField(
  options: Omit<ApiPropertyOptions, 'type'> & IStringFieldOptions = {},
): PropertyDecorator {
  const decorators = [StringField(options), IsUrl({}, { each: true })];

  if (options.nullable) {
    decorators.push(IsNullable({ each: options.each }));
  } else {
    decorators.push(NotEquals(null, { each: options.each }));
  }

  return applyDecorators(...decorators);
}

export function URLFieldOptional(
  options: Omit<ApiPropertyOptions, 'type'> & IStringFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(
    IsOptional({ each: options.each }),
    URLField({ required: false, ...options }),
  );
}

export function DateField(
  options: Omit<ApiPropertyOptions, 'type'> & IFieldOptions = {},
): PropertyDecorator {
  const decorators = [Type(() => Date), IsDate()];

  if (options.nullable) {
    decorators.push(IsNullable());
  } else {
    decorators.push(NotEquals(null));
  }

  if (options.swagger !== false) {
    const { required = true, ...restOptions } = options;
    decorators.push(
      ApiProperty({ type: Date, required: !!required, ...restOptions }),
    );
  }

  return applyDecorators(...decorators);
}

export function DateFieldOptional(
  options: Omit<ApiPropertyOptions, 'type' | 'required'> & IFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(
    IsOptional({ each: options.each }),
    DateField({ ...options, required: false }),
  );
}

export function EnumField<TEnum extends object>(
  getEnum: () => TEnum,
  options: Omit<ApiPropertyOptions, 'type' | 'enum' | 'isArray'> &
    IEnumFieldOptions = {},
): PropertyDecorator {
  const decorators = [IsEnum(getEnum(), { each: options.each })];

  if (options.nullable) {
    decorators.push(IsNullable());
  } else {
    decorators.push(NotEquals(null));
  }

  if (options.swagger !== false) {
    const { required = true, ...restOptions } = options;
    decorators.push(
      ApiProperty({
        enum: getEnum(),
        enumName: options.enumName || getVariableName(getEnum),
        isArray: options.each,
        required: !!required,
        ...restOptions,
      }),
    );
  }

  return applyDecorators(...decorators);
}

export function EnumFieldOptional<TEnum extends object>(
  getEnum: () => TEnum,
  options: Omit<ApiPropertyOptions, 'type' | 'required' | 'enum'> &
    IEnumFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(
    IsOptional({ each: options.each }),
    EnumField(getEnum, { required: false, ...options }),
  );
}

// Add to field.decorators.ts

export function ObjectField(
  options: Omit<ApiPropertyOptions, 'type'> & IFieldOptions = {},
): PropertyDecorator {
  const decorators = [IsObject({ each: options.each })];

  if (options.nullable) {
    decorators.push(IsNullable({ each: options.each }));
  } else {
    decorators.push(NotEquals(null, { each: options.each }));
  }

  if (options.swagger !== false) {
    const { required = true, ...restOptions } = options;
    decorators.push(
      ApiProperty({ type: Object, required: !!required, ...restOptions }),
    );
  }

  return applyDecorators(...decorators);
}

export function ObjectFieldOptional(
  options: Omit<ApiPropertyOptions, 'type' | 'required'> & IFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(
    IsOptional(),
    ObjectField({ required: false, nullable: true, ...options }),
  );
}

export function ArrayField(
  options: Omit<ApiPropertyOptions, 'type'> & IFieldOptions = {},
): PropertyDecorator {
  const decorators = [IsArray()];

  if (options.nullable) {
    decorators.push(IsNullable());
  } else {
    decorators.push(NotEquals(null));
  }

  if (options.swagger !== false) {
    const { required = true, ...restOptions } = options;
    decorators.push(
      ApiProperty({
        type: [Object],
        required: !!required,
        isArray: true,
        ...restOptions,
      }),
    );
  }

  return applyDecorators(...decorators);
}

export function ArrayFieldOptional(
  options: Omit<ApiPropertyOptions, 'type' | 'required'> & IFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(
    IsOptional(),
    ArrayField({ required: false, nullable: true, ...options }),
  );
}

export function NestedField<T>(
  typeFn: () => ClassType<T>,
  options: Omit<ApiPropertyOptions, 'type' | 'required'> & IFieldOptions = {},
): PropertyDecorator {
  const { nullable, each, swagger, ...restOptions } = options;

  const decorators: PropertyDecorator[] = [
    ValidateNested({ each: !!each }),
    Type(typeFn),
    ApiProperty({
      type: typeFn,
      required: true,
      nullable: !!nullable,
      isArray: !!each,
      ...restOptions,
    }),
  ];

  if (nullable) decorators.push(IsNullable({ each: !!each }));
  else decorators.push(NotEquals(null, { each: !!each }));

  return applyDecorators(...decorators);
}

export function NestedFieldOptional<T>(
  typeFn: () => ClassType<T>,
  options: Omit<ApiPropertyOptions, 'type'> & IFieldOptions = {}, // ← remove 'required' from Omit
): PropertyDecorator {
  return applyDecorators(
    IsOptional(),
    NestedField(typeFn, { required: false, nullable: true, ...options }),
  );
}

export function ClassField<TClass extends Constructor>(
  getClass: () => TClass,
  options: Omit<ApiPropertyOptions, 'type'> & IClassFieldOptions = {},
): PropertyDecorator {
  const decorators = [
    Type(() => getClass()),
    ValidateNested({ each: options.each }),
  ];

  if (options.required !== false) {
    decorators.push(IsDefined());
  }

  if (options.nullable) {
    decorators.push(IsNullable());
  } else {
    decorators.push(NotEquals(null));
  }

  if (options.swagger !== false) {
    const { required = true, ...restOptions } = options;
    decorators.push(
      ApiProperty({
        type: () => getClass(),
        required: !!required,
        ...restOptions,
      }),
    );
  }

  return applyDecorators(...decorators);
}

export function ClassFieldOptional<TClass extends Constructor>(
  getClass: () => TClass,
  options: Omit<ApiPropertyOptions, 'type' | 'required'> &
    IClassFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(
    IsOptional({ each: options.each }),
    ClassField(getClass, { required: false, ...options }),
  );
}

function getVariableName(variableFunction: () => any) {
  return variableFunction.toString().split('.').pop();
}
