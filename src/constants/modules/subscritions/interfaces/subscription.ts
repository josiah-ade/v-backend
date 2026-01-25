export type PaystackInterval = 'weekly' | 'monthly' | 'annually';

export interface CreatePlanInput {
  name: string;
  interval: PaystackInterval;
  amount: number; // kobo
  description?: string;
  currency?: string; // default NGN
}
