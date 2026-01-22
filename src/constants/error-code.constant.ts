export enum ErrorCode {
  // Common
  V000 = 'common.validation.error',
  R000 = 'resource.validation.id.error',
  I002 = 'item.error.not_found',
  I003 = 'item.error.already_exist',
  I004 = 'item.id.missing',
  I005 = 'file.not.uploaded',

  // User Validation
  V001 = 'user.validation.is_empty',
  V002 = 'user.validation.is_invalid',

  // User Errors
  E001 = 'user.error.username_or_email_exists',
  E002 = 'user.error.not_found',
  E003 = 'user.error.email_exists',
  E004 = 'user.password.email_not_exists',
}
