import Link from 'next/link';
import { getCurrentSession } from '@/src/lib/auth';
import { db } from '@/src/lib/db';
import { mapOrderForView } from '@/src/lib/customer-data';
import { OrderStatusBadge } from '@/src/components/orders/order-status-badge';
import { getOrdersForUser } from '@/src/server/queries/customer';

export const dynamic = 'force-dynamic';

const paymentStatusLabels: Record<string, { label: string; color: string }> = {
  APPROVED: { label: 'Оплачено', color: 'text-green-600' },
  PENDING:  { label: 'Очікує оплати', color: 'text-yellow-600' },
  DECLINED: { label: 'Оплата відхилена', color: 'text-red-600' },
  EXPIRED:  { label: 'Оплата прострочена', color: 'text-app-muted' },
};

export default async function OrdersPage() {
  const session = await getCurrentSession().catch(() => null);
  const appUser = session?.user?.email
    ? await db.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      })
    : null;
  const orders = appUser?.id ? await getOrdersForUser(appUser.id) : [];

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:px-8">
      <h1 className="font-display text-5xl text-app-text">Мої замовлення</h1>

      {orders.length === 0 ? (
        <p className="mt-8 text-app-secondary">Замовлень ще немає.</p>
      ) : (
        <div className="mt-8 grid gap-4">
          {orders.map((order) => {
            const view = mapOrderForView({
              type: order.type,
              status: order.status,
              hasAccessibleResult: order.libraryItems.length > 0,
            });
            const payment = order.payment;
            const paymentInfo = payment
              ? paymentStatusLabels[payment.status] ?? { label: payment.status, color: 'text-app-muted' }
              : null;
            const date = order.createdAt.toLocaleDateString('uk-UA', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            });

            return (
              <div
                key={order.id}
                className="rounded-[var(--radius-lg)] border border-app-border bg-app-surface p-5 shadow-soft"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <p className="font-medium text-app-text truncate">
                      {order.tale?.title ?? view.typeLabel}
                    </p>
                    <p className="text-xs text-app-muted">
                      #{order.id.slice(0, 8).toUpperCase()} · {date}
                    </p>
                  </div>
                  <OrderStatusBadge label={view.statusLabel} />
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-4 text-sm">
                    {paymentInfo && (
                      <span className={paymentInfo.color}>{paymentInfo.label}</span>
                    )}
                    {payment?.amount && (
                      <span className="text-app-secondary">{payment.amount} грн</span>
                    )}
                  </div>
                  <Link
                    href={`/orders/${order.id}`}
                    className="text-sm font-medium text-app-accent hover:underline"
                  >
                    Відкрити →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
