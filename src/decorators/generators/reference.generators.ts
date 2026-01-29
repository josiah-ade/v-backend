import { randomBytes } from 'crypto';

export class ReferenceGenerator {
  static generate(prefix = 'PS'): string {
    const randomPart = randomBytes(12).toString('hex'); // 24 chars
    return `${prefix}-${randomPart}`;
  }

  static generateWithTimestamp(prefix = 'PS'): string {
    const timestamp = Date.now();
    const randomPart = randomBytes(6).toString('hex');
    return `${prefix}-${timestamp}-${randomPart}`;
  }

  static isValid(reference: string, prefix = 'PS'): boolean {
    const regex = new RegExp(`^${prefix}-[a-f0-9-]+$`, 'i');
    return regex.test(reference);
  }
}
