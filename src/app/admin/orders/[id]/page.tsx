import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentSession } from '@/src/lib/auth'
import { db } from '@/src/lib/db'
import { getAdminOrderDetail } from '@/src/server/queries/admin-orders'
import { mapOrderForView, mapOrderMessageForView } from '@/src/lib/customer-data'
import { OrderStatusBadge } from '@/src/components/orders/order-status-badge'
import { OrderRealtimeChat } from '@/src/components/orders/order-realtime-chat'
import { AdminOrderStatusForm } from '@/src/components/admin/order-status-form'
import { TrackingNumberForm } from '@/src/components/admin/tracking-number-form'
import { sendAdminMessage } from '@/src/server/actions/admin-orders'
import { DashboardShell } from '@/src/components/layout/dashboard-shell'
import { OrderStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'

const adminItems = [
  { href: '/admin/users', label: 'Користувачі' },
  { href: '/admin/tales', label: 'Керування книгами' },
  { href: '/admin/categories', label: 'Категорії' },
  { href: '/admin/orders', label: 'Замовлення' },
]

const paymentStatusLabels: Record<string, string> = {
  PENDING: 'Очікує оплати',
  APPROVED: 'Оплачено',
  DECLINED: 'Відхилено',
  EXPIRED: 'Прострочено',
}

const deliveryServiceLabel: Record<string, string> = {
  NOVA_POSHTA: 'Нова Пошта',
  UKRPOSHTA: 'Укрпошта',
}

const deliveryTypeLabel: Record<string, string> = {
  BRANCH: 'Відділення / поштомат',
  COURIER: 'Кур\'єр',
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // 1. Auth
  const session = await getCurrentSession().catch(() => null)
  const appUser = session?.user?.email
    ? await db.user.findUnique({
        where: { email: session.user.email },
        select: { role: true },
      })
    : null

  if (!appUser || (appUser.role !== 'ADMIN' && appUser.role !== 'SUPERADMIN')) {
    redirect('/login')
  }

  // 2. Params
  const { id } = await params

  // 3. Fetch order
  const order = await getAdminOrderDetail(id)
  if (!order) notFound()

  // 4. Map data
  const messages = order.messages.map(mapOrderMessageForView)
  const { typeLabel, statusLabel } = mapOrderForView(order)

  return (
    <DashboardShell title="Адмінка" items={adminItems}>
      <div className="space-y-8">
        {/* Header row */}
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/admin/orders"
            className="text-sm text-app-secondary hover:text-app-text transition-colors"
          >
            ← Назад до замовлень
          </Link>
          <div className="flex flex-1 flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl text-app-text">
              Замовлення #{order.id.slice(0, 8)}
            </h1>
            <OrderStatusBadge label={statusLabel} />
          </div>
        </div>

        {/* Info grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Card 1 — Клієнт */}
          <div className="rounded-[var(--radius-lg)] border border-app-border bg-app-surface p-6 shadow-soft space-y-2">
            <h2 className="font-medium text-app-text">Клієнт</h2>
            <p className="text-sm text-app-text">{order.customer.name ?? '—'}</p>
            <p className="text-sm text-app-secondary">{order.customer.email}</p>
            <Link
              href="/admin/users"
              className="text-xs text-app-accent hover:underline"
            >
              Переглянути користувачів
            </Link>
          </div>

          {/* Card 2 — Казка */}
          <div className="rounded-[var(--radius-lg)] border border-app-border bg-app-surface p-6 shadow-soft space-y-2">
            <h2 className="font-medium text-app-text">Казка</h2>
            <p className="text-sm text-app-text">{order.tale?.title ?? '—'}</p>
            <p className="text-sm text-app-secondary">{typeLabel}</p>
            {order.tale?.price != null && (
              <p className="text-sm text-app-secondary">{order.tale.price} грн</p>
            )}
          </div>

          {/* Card 3 — Оплата */}
          <div className="rounded-[var(--radius-lg)] border border-app-border bg-app-surface p-6 shadow-soft space-y-2">
            <h2 className="font-medium text-app-text">Оплата</h2>
            {order.payment ? (
              <>
                <p className="text-sm text-app-text">
                  {paymentStatusLabels[order.payment.status] ?? order.payment.status}
                </p>
                <p className="text-sm text-app-secondary">{order.payment.amount} грн</p>
                {order.payment.transactionId && (
                  <p className="text-xs text-app-muted">
                    ID транзакції: {order.payment.transactionId}
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-app-secondary">Оплата не знайдена</p>
            )}
          </div>

          {/* Card 4 — Доставка */}
          <div className="rounded-[var(--radius-lg)] border border-app-border bg-app-surface p-6 shadow-soft space-y-2">
            <h2 className="font-medium text-app-text">Доставка</h2>
            {order.delivery ? (
              <>
                <p className="text-sm text-app-text">
                  {deliveryServiceLabel[order.delivery.service] ?? order.delivery.service}
                </p>
                <p className="text-sm text-app-secondary">
                  {deliveryTypeLabel[order.delivery.deliveryType] ?? order.delivery.deliveryType}
                </p>
                <p className="text-sm text-app-secondary">{order.delivery.city}</p>
                {order.delivery.deliveryType === 'BRANCH' ? (
                  order.delivery.branchNumber && (
                    <p className="text-sm text-app-secondary">
                      Відділення №{order.delivery.branchNumber}
                    </p>
                  )
                ) : (
                  <p className="text-sm text-app-secondary">
                    {[order.delivery.street, order.delivery.house, order.delivery.apartment]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                )}
                <p className="text-sm text-app-secondary">
                  {order.delivery.recipientName} · {order.delivery.recipientPhone}
                </p>
              </>
            ) : (
              <p className="text-sm text-app-secondary">Доставка не вказана</p>
            )}
          </div>
        </div>

        {/* Status form */}
        <AdminOrderStatusForm
          orderId={order.id}
          currentStatus={order.status as OrderStatus}
        />

        {/* TTN form */}
        <TrackingNumberForm
          orderId={order.id}
          currentTrackingNumber={order.trackingNumber ?? null}
        />

        {/* Chat */}
        <div className="space-y-4">
          <h2 className="font-display text-2xl text-app-text">Переписка</h2>
          <OrderRealtimeChat
            orderId={order.id}
            initialMessages={messages}
            myRole={appUser.role as 'ADMIN' | 'SUPERADMIN'}
            sendAction={sendAdminMessage}
          />
        </div>
      </div>
    </DashboardShell>
  )
}
