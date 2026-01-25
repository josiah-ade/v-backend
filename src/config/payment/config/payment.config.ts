import validateConfig from '@/utils/validate-config';
import { registerAs } from '@nestjs/config';
import { IsNotEmpty, IsString } from 'class-validator';
import { PaymentConfig } from './payment-config.type';

class EnvironmentVariablesValidator {
  @IsString()
  @IsNotEmpty()
  PAYSTACK_PUBLIC_KEY: string;

  @IsString()
  @IsNotEmpty()
  PAYSTACK_SECRET_KEY: string;
}

export default registerAs<PaymentConfig>('payment', () => {
  console.info(`Register PaymentConfig from environment variables`);
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    paystackSecretKey: process.env.PAYSTACK_SECRET_KEY,
    paystackPublicKey: process.env.PAYSTACK_PUBLIC_KEY,
  };
});
