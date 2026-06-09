import Link from 'next/link';
import { getCurrentSession } from '@/src/lib/auth';
import { db } from '@/src/lib/db';
import { mapOrderForView } from '@/src/lib/customer-data';
import { OrderStatusBadge } from '@/src/components/orders/order-status-badge';
import { getOrdersForUser } from '@/src/server/queries/customer';

type UserOrder = Awaited<ReturnType<typeof getOrdersForUser>>[number];

export const dynamic = 'force-dynamic';

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
      <div className="mt-8 grid gap-4">
          {orders.map((order: UserOrder) => {
            const view = mapOrderForView({
              ...order,
              hasAccessibleResult: order.libraryItems.length > 0,
            });


          return (
            <div
              key={order.id}
              className="rounded-[var(--radius-lg)] border border-app-border bg-app-surface p-6 shadow-soft"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-2">
                  <h2 className="font-display text-2xl text-app-text">{view.typeLabel}</h2>
                  <Link href={`/orders/${order.id}`} className="text-sm font-medium text-app-accent">
                    Відкрити деталі
                  </Link>
                </div>
                <OrderStatusBadge label={view.statusLabel} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
