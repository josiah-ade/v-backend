export enum ErrorCode {
  // Common
  V000 = 'common.validation.error',

  // User Validation
  V001 = 'user.validation.is_empty',
  V002 = 'user.validation.is_invalid',

  // User Errors
  E001 = 'user.error.username_or_email_exists',
  E002 = 'user.error.not_found',
  E003 = 'user.error.email_exists',

  // Favourite Errors
  F001 = 'favourite.error.already_added',
  F002 = 'favourite.error.not_found',
}
