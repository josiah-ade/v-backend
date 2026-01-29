type SubscriptionDuration = 'weekly' | 'monthly' | 'annually';

export function calculateEndDate(
  startDate: Date,
  duration: SubscriptionDuration,
): Date {
  const endDate = new Date(startDate); 

  switch (duration) {
    case 'weekly':
      endDate.setDate(endDate.getDate() + 7);
      break;

    case 'monthly':
      endDate.setMonth(endDate.getMonth() + 1);
      break;

    case 'annually':
      endDate.setFullYear(endDate.getFullYear() + 1);
      break;

    default:
      throw new Error('Invalid subscription duration');
  }

  return endDate;
}
