'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/src/lib/db';
import { getCurrentSession } from '@/src/lib/auth';

export async function markOrderChatSeen(orderId: string) {
  const session = await getCurrentSession();
  if (!session?.user?.email) return;

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return;

  await db.orderChatSeen.upsert({
    where: { userId_orderId: { userId: user.id, orderId } },
    create: { userId: user.id, orderId },
    update: { seenAt: new Date() },
  });

  // Invalidate the root layout so the unread badge re-fetches on next router.refresh()
  revalidatePath('/', 'layout');
}
