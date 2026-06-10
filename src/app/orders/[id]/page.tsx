import { notFound } from 'next/navigation';
import { getCurrentSession } from '@/src/lib/auth';
import { db } from '@/src/lib/db';
import { mapOrderForView, mapOrderMessageForView } from '@/src/lib/customer-data';
import { OrderStatusBadge } from '@/src/components/orders/order-status-badge';
import { OrderRealtimeChat } from '@/src/components/orders/order-realtime-chat';
import { getOrderDetailForUser } from '@/src/server/queries/customer';
import { sendCustomerMessage } from '@/src/server/actions/customer-messages';

export const dynamic = 'force-dynamic';

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getCurrentSession().catch(() => null);
  const { id } = await params;

  if (!session?.user?.email) {
    notFound();
  }

  const appUser = await db.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!appUser) {
    notFound();
  }

  const order = await getOrderDetailForUser(id, appUser.id);

  if (!order) {
    notFound();
  }

  const messages = order.messages.map(mapOrderMessageForView);
  const resultIsAvailable = order.libraryItems.length > 0;
  const view = mapOrderForView({ type: order.type, status: order.status, hasAccessibleResult: resultIsAvailable });

  return (
    <section className="mx-auto max-w-3xl px-4 py-16 md:px-8">
      <div className="space-y-6">
        <h1 className="font-display text-5xl text-app-text">Деталі замовлення</h1>
        <div className="rounded-[var(--radius-lg)] border border-app-border bg-app-surface p-6 shadow-soft">
          <div className="flex items-center gap-3">
            <OrderStatusBadge label={view.statusLabel} />
          </div>
          <p className="mt-3 text-sm text-app-secondary">{view.resultStateLabel}</p>
        </div>
        <OrderRealtimeChat
          orderId={id}
          initialMessages={messages}
          myRole="CUSTOMER"
          sendAction={sendCustomerMessage}
        />
      </div>
    </section>
  );
}
