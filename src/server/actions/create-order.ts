'use server'

import { getCurrentSession } from '@/src/lib/auth'
import { db } from '@/src/lib/db'
import { deliverySchema, type DeliveryInput } from '@/src/lib/validators/delivery'
import { sendOrderConfirmationEmail } from '@/src/server/emails/orders'

export type CreateOrderResult =
  | { ok: true; orderId: string }
  | { ok: false; error: string }

export async function createOrderAction(
  taleId: string,
  delivery: DeliveryInput,
): Promise<CreateOrderResult> {
  const session = await getCurrentSession()

  if (!session?.user?.email) {
    return { ok: false, error: 'Увійдіть, щоб оформити замовлення' }
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  })

  if (!user) {
    return { ok: false, error: 'Користувача не знайдено' }
  }

  const parsed = deliverySchema.safeParse(delivery)
  if (!parsed.success) {
    return { ok: false, error: 'Невірні дані доставки' }
  }

  const tale = await db.tale.findUnique({
    where: { id: taleId, published: true },
    select: { accessType: true },
  })

  if (!tale) {
    return { ok: false, error: 'Казку не знайдено' }
  }

  if (tale.accessType === 'FREE') {
    return { ok: false, error: 'Ця казка безкоштовна — її не потрібно замовляти' }
  }

  const orderType =
    tale.accessType === 'PERSONALIZABLE' ? 'PERSONALIZED_TEMPLATE' : 'READY_TALE'

  const order = await db.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        type: orderType,
        customerId: user.id,
        taleId,
      },
    })

    await tx.delivery.create({
      data: {
        orderId: newOrder.id,
        service: parsed.data.service,
        deliveryType: parsed.data.deliveryType,
        city: parsed.data.city,
        cityRef: parsed.data.cityRef || null,
        branchNumber: parsed.data.branchNumber ?? null,
        branchRef:
          parsed.data.deliveryType === 'BRANCH' ? parsed.data.branchRef || null : null,
        street: parsed.data.street ?? null,
        house: parsed.data.house ?? null,
        apartment: parsed.data.apartment ?? null,
        recipientName: parsed.data.recipientName,
        recipientPhone: parsed.data.recipientPhone,
      },
    })

    return newOrder
  })

  // Fire confirmation email — non-blocking, failure must not break the order flow
  db.order.findUnique({
    where: { id: order.id },
    select: {
      id: true,
      customer: { select: { email: true, name: true } },
      tale: { select: { title: true } },
      delivery: { select: { recipientName: true, city: true } },
    },
  }).then((full) => {
    if (full) sendOrderConfirmationEmail(full).catch(console.error);
  }).catch(console.error);

  return { ok: true, orderId: order.id }
}
