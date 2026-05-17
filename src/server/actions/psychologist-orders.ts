import type { OrderStatus } from '@/src/lib/user-types';

type PsychologistResultInput = {
  resultTitle: string;
  resultBody: string;
};

const allowedTransitions: Partial<Record<OrderStatus, OrderStatus[]>> = {
  NEW: ['IN_REVIEW'],
  IN_REVIEW: ['IN_PROGRESS'],
  IN_PROGRESS: ['AWAITING_CUSTOMER', 'COMPLETED'],
  AWAITING_CUSTOMER: ['IN_PROGRESS', 'COMPLETED'],
};

export function canTransitionPsychologistOrder(from: OrderStatus, to: OrderStatus) {
  return allowedTransitions[from]?.includes(to) ?? false;
}

export function normalizePsychologistResult({
  resultTitle,
  resultBody,
}: PsychologistResultInput) {
  const normalizedTitle = resultTitle.trim();
  const normalizedBody = resultBody.trim();

  return {
    resultTitle: normalizedTitle === '' ? null : normalizedTitle,
    resultBody: normalizedBody === '' ? null : normalizedBody,
  };
}
