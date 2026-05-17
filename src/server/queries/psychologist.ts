import { db } from '@/src/lib/db';

export async function getPsychologistSummary() {
  return db.order.count({
    where: {
      type: 'CUSTOM_PSYCHOLOGIST',
    },
  });
}

export async function getPsychologistInbox() {
  return db.order.findMany({
    where: {
      type: 'CUSTOM_PSYCHOLOGIST',
    },
    include: {
      customer: true,
      tale: true,
    },
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
  });
}

export async function getPsychologistOrderDetail(id: string) {
  return db.order.findFirst({
    where: {
      id,
      type: 'CUSTOM_PSYCHOLOGIST',
    },
    include: {
      customer: true,
      tale: true,
      messages: {
        include: {
          author: true,
        },
        orderBy: [{ createdAt: 'asc' }],
      },
    },
  });
}
