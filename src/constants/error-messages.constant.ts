import { ErrorCode } from './error-code.constant';

export const ErrorMessages: Record<ErrorCode, string> = {
  [ErrorCode.V000]: 'Validation failed',
  [ErrorCode.R000]: 'Id not provided',
  [ErrorCode.I002]: 'Item not found',
  [ErrorCode.I003]: 'Item already exist',

  [ErrorCode.V001]: 'Required field is empty',
  [ErrorCode.V002]: 'Invalid field value',

  [ErrorCode.E001]: 'Username or email already exists',
  [ErrorCode.E002]: 'User not found',
  [ErrorCode.E003]: 'Email already exists',

  // Avatar
  [ErrorCode.A001]: 'No file uploaded',
  [ErrorCode.A002]: 'Avatar Image does not exist',

  // AI
  [ErrorCode.AI001]: 'Text prompt must not be empty or less than 10 letters',
  [ErrorCode.AI002]: 'Image sketch not provided',

  // Creation
  [ErrorCode.CR001]: 'You already have a creation with this title',
};
