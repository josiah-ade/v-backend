import { ErrorCode } from './error-code.constant';

export const ErrorMessages: Record<ErrorCode, string> = {
  [ErrorCode.V000]: 'Validation failed',
  [ErrorCode.V001]: 'Required field is empty',
  [ErrorCode.V002]: 'Invalid field value',

  [ErrorCode.E001]: 'Username or email already exists',
  [ErrorCode.E002]: 'User not found',
  [ErrorCode.E003]: 'Email already exists',

  [ErrorCode.F001]: 'Item already added to favourites',
  [ErrorCode.F002]: 'Item not found',
};
