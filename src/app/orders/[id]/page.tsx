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
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ paid?: string }>;
}) {
  const session = await getCurrentSession().catch(() => null);
  const { id } = await params;
  const { paid } = await searchParams;

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

        {/* Payment success banner */}
        {paid === '1' && (
          <div className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-green-200 bg-green-50 p-5">
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <p className="font-medium text-green-800">Оплата пройшла успішно</p>
              <p className="mt-0.5 text-sm text-green-700">
                Ми вже отримали ваше замовлення і скоро почнемо роботу над казкою. Очікуйте повідомлення від нас.
              </p>
            </div>
          </div>
        )}

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
