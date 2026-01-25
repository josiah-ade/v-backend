

export function buildSuccessMessage(message: string) {
  return {
    success: true,
    message,
  };
}

export function buildFailMessage(message: string) {
  return {
    success: false,
    message,
  };
}
