'use server';

import { db } from '@/src/lib/db';
import { getCurrentSession } from '@/src/lib/auth';
import { mapOrderMessageForView } from '@/src/lib/customer-data';
import { broadcastOrderChatMessage } from '@/src/lib/supabase-broadcast';

export async function sendCustomerMessage(
  orderId: string,
  body: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await getCurrentSession();
  if (!session?.user?.email) return { ok: false, error: 'Не авторизовано' };

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true, name: true },
  });
  if (!user) return { ok: false, error: 'Не авторизовано' };

  if (!body || typeof body !== 'string') return { ok: false, error: 'Повідомлення не може бути порожнім' };
  const trimmed = body.trim();
  if (!trimmed) return { ok: false, error: 'Повідомлення не може бути порожнім' };

  // Customer can only message on their own orders
  const order = await db.order.findFirst({
    where: { id: orderId, customerId: user.id },
    select: { id: true },
  });
  if (!order) return { ok: false, error: 'Замовлення не знайдено' };

  const created = await db.orderMessage.create({
    data: { orderId, authorId: user.id, body: trimmed },
    include: { author: true },
  });

  const view = mapOrderMessageForView(created);
  await broadcastOrderChatMessage(orderId, view).catch(console.error);

  return { ok: true as const };
}
