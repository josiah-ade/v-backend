export function buildSuccessMessage(message: string) {
  return {
    status: 'success',
    message,
  };
}

export function buildnotFoundMessage(message: string) {
  return {
    status: 'not found',
    message,
  };
}
