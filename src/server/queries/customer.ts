import { db } from '@/src/lib/db';
import { getPublicImageUrl } from '@/src/lib/storage';

export async function getLibraryForUser(userId: string) {
  const items = await db.libraryItem.findMany({
    where: { userId },
    include: { tale: true },
    orderBy: { createdAt: 'desc' },
  });

  return items.map((item: (typeof items)[number]) => ({
    ...item,
    tale: {
      ...item.tale,
      coverUrl: item.tale.coverPath ? getPublicImageUrl(item.tale.coverPath) : null,
    },
  }));
}


export async function getOrdersForUser(userId: string) {
  return db.order.findMany({
    where: { customerId: userId },
    include: {
      tale: { select: { title: true } },
      payment: { select: { status: true, amount: true } },
      libraryItems: { select: { id: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getOrderDetailForUser(orderId: string, userId: string) {
  return db.order.findFirst({
    where: {
      id: orderId,
      customerId: userId,
    },
    include: {
      tale: true,
      libraryItems: true,
      messages: {
        include: {
          author: true,
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });
}
