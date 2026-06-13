'use server'

import { getCurrentSession } from '@/src/lib/auth'
import { db } from '@/src/lib/db'
import { OrderStatus } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { mapOrderMessageForView } from '@/src/lib/customer-data'
import { sendOrderStatusEmail, sendShippingEmail } from '@/src/server/emails/orders'

const EMAIL_TRIGGER_STATUSES = new Set<OrderStatus>([
  OrderStatus.IN_PROGRESS,
  OrderStatus.AWAITING_CUSTOMER,
  OrderStatus.COMPLETED,
  OrderStatus.CANCELLED,
])

const adminTransitions: Partial<Record<OrderStatus, OrderStatus[]>> = {
  NEW: [OrderStatus.IN_REVIEW, OrderStatus.CANCELLED],
  IN_REVIEW: [OrderStatus.IN_PROGRESS, OrderStatus.CANCELLED],
  IN_PROGRESS: [OrderStatus.AWAITING_CUSTOMER, OrderStatus.COMPLETED, OrderStatus.CANCELLED],
  AWAITING_CUSTOMER: [OrderStatus.IN_PROGRESS, OrderStatus.COMPLETED, OrderStatus.CANCELLED],
}

async function requireAdmin() {
  const session = await getCurrentSession()
  if (!session?.user?.email) return null

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  })
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN')) return null
  return user
}

export async function updateOrderStatus(orderId: string, newStatus: string) {
  const admin = await requireAdmin()
  if (!admin) return { ok: false as const, error: 'Не авторизовано' }

  if (!Object.values(OrderStatus).includes(newStatus as OrderStatus)) {
    return { ok: false as const, error: 'Невірний статус' }
  }

  const order = await db.order.findUnique({
    where: { id: orderId },
    select: { status: true, customer: { select: { email: true } } },
  })
  if (!order) return { ok: false as const, error: 'Замовлення не знайдено' }

  const allowed = adminTransitions[order.status] ?? []
  if (!allowed.includes(newStatus as OrderStatus)) {
    return { ok: false as const, error: 'Недопустимий перехід статусу' }
  }

  await db.order.update({
    where: { id: orderId },
    data: { status: newStatus as OrderStatus },
  })

  if (EMAIL_TRIGGER_STATUSES.has(newStatus as OrderStatus)) {
    sendOrderStatusEmail(
      { id: orderId, customer: order.customer },
      newStatus,
    ).catch(console.error)
  }

  revalidatePath(`/admin/orders/${orderId}`)
  revalidatePath('/admin/orders')
  return { ok: true as const }
}

export async function sendAdminMessage(orderId: string, body: string) {
  const admin = await requireAdmin()
  if (!admin) return { ok: false as const, error: 'Не авторизовано' }

  if (!body || typeof body !== 'string') return { ok: false as const, error: 'Повідомлення не може бути порожнім' }
  const trimmed = body.trim()
  if (!trimmed) return { ok: false as const, error: 'Повідомлення не може бути порожнім' }

  const order = await db.order.findUnique({ where: { id: orderId }, select: { id: true } })
  if (!order) return { ok: false as const, error: 'Замовлення не знайдено' }

  const created = await db.orderMessage.create({
    data: { orderId, authorId: admin.id, body: trimmed },
    include: { author: true },
  })

  return { ok: true as const, message: mapOrderMessageForView(created) }
}

export async function setTrackingNumber(
  orderId: string,
  trackingNumber: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = await requireAdmin()
  if (!admin) return { ok: false, error: 'Не авторизовано' }

  const trimmed = trackingNumber.trim()
  if (!trimmed) return { ok: false, error: 'Номер ТТН не може бути порожнім' }

  const order = await db.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      trackingNumber: true,
      customer: { select: { email: true, name: true } },
      delivery: { select: { service: true, recipientName: true } },
    },
  })
  if (!order) return { ok: false, error: 'Замовлення не знайдено' }

  await db.order.update({
    where: { id: orderId },
    data: { trackingNumber: trimmed },
  })

  if (order.trackingNumber !== trimmed) {
    sendShippingEmail(order, trimmed).catch(console.error)
  }

  revalidatePath(`/admin/orders/${orderId}`)
  return { ok: true }
}
