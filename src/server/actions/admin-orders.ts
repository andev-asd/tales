'use server'

import { getCurrentSession } from '@/src/lib/auth'
import { db } from '@/src/lib/db'
import { OrderStatus } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { mapOrderMessageForView } from '@/src/lib/customer-data'
import { broadcastOrderChatMessage } from '@/src/lib/supabase-broadcast'

// Allowed transitions for admin (full control)
const adminTransitions: Partial<Record<OrderStatus, OrderStatus[]>> = {
  NEW: [OrderStatus.IN_REVIEW, OrderStatus.CANCELLED],
  IN_REVIEW: [OrderStatus.IN_PROGRESS, OrderStatus.CANCELLED],
  IN_PROGRESS: [OrderStatus.AWAITING_CUSTOMER, OrderStatus.COMPLETED, OrderStatus.CANCELLED],
  AWAITING_CUSTOMER: [OrderStatus.IN_PROGRESS, OrderStatus.COMPLETED, OrderStatus.CANCELLED],
}

export async function updateOrderStatus(orderId: string, newStatus: string) {
  // 1. Auth — require ADMIN or SUPERADMIN role
  const session = await getCurrentSession()
  if (!session?.user?.email) return { ok: false as const, error:'Не авторизовано' }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  })
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN')) {
    return { ok: false as const, error:'Доступ заборонено' }
  }

  // 2. Validate newStatus is a valid OrderStatus
  if (!Object.values(OrderStatus).includes(newStatus as OrderStatus)) {
    return { ok: false as const, error:'Невірний статус' }
  }

  // 3. Load current order status
  const order = await db.order.findUnique({
    where: { id: orderId },
    select: { status: true },
  })
  if (!order) return { ok: false as const, error:'Замовлення не знайдено' }

  // 4. Check transition is allowed
  const allowed = adminTransitions[order.status] ?? []
  if (!allowed.includes(newStatus as OrderStatus)) {
    return { ok: false as const, error:'Недопустимий перехід статусу' }
  }

  // 5. Update
  await db.order.update({
    where: { id: orderId },
    data: { status: newStatus as OrderStatus },
  })

  revalidatePath(`/admin/orders/${orderId}`)
  revalidatePath('/admin/orders')
  return { ok: true as const }
}

export async function sendAdminMessage(orderId: string, body: string) {
  // 1. Auth — require ADMIN or SUPERADMIN
  const session = await getCurrentSession()
  if (!session?.user?.email) return { ok: false as const, error:'Не авторизовано' }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  })
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN')) {
    return { ok: false as const, error:'Доступ заборонено' }
  }

  // 2. Validate
  if (!body || typeof body !== 'string') return { ok: false as const, error:'Повідомлення не може бути порожнім' }
  const trimmed = body.trim()
  if (!trimmed) return { ok: false as const, error:'Повідомлення не може бути порожнім' }

  // 3. Check order exists
  const order = await db.order.findUnique({ where: { id: orderId }, select: { id: true } })
  if (!order) return { ok: false as const, error:'Замовлення не знайдено' }

  // 4. Create message and broadcast
  const created = await db.orderMessage.create({
    data: { orderId, authorId: user.id, body: trimmed },
    include: { author: true },
  })

  const view = mapOrderMessageForView(created)
  await broadcastOrderChatMessage(orderId, view).catch(console.error)

  return { ok: true as const, message: view }
}
