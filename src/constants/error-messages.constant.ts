import { ErrorCode } from './error-code.constant';

export const ErrorMessages: Record<ErrorCode, string> = {
  [ErrorCode.V000]: 'Validation failed',
  [ErrorCode.R000]: 'Id not provided',
  [ErrorCode.I002]: 'Item not found',
  [ErrorCode.I003]: 'Item already exist',
  [ErrorCode.I004]: 'Item id missing',
  [ErrorCode.I005]: 'File not uploaded',

  [ErrorCode.V001]: 'Required field is empty',
  [ErrorCode.V002]: 'Invalid field value',

  [ErrorCode.E001]: 'Username or email already exists',
  [ErrorCode.E002]: 'User not found',
  [ErrorCode.E003]: 'Email already exists',
  [ErrorCode.E004]: 'You entered wrong email or password',

  [ErrorCode.S001]: 'Failed to create subscription plan',

  [ErrorCode.P001]: 'Payment reference not found',
  [ErrorCode.P002]: 'Payment verification failed',
};
