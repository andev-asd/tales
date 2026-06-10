import { notFound } from 'next/navigation';
import { getCurrentSession } from '@/src/lib/auth';
import { db } from '@/src/lib/db';
import { mapOrderForView, mapOrderMessageForView } from '@/src/lib/customer-data';
import { OrderMessageThread } from '@/src/components/orders/order-message-thread';
import { getOrderDetailForUser } from '@/src/server/queries/customer';

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
    <section className="mx-auto max-w-5xl px-4 py-16 md:px-8">
      <div className="space-y-6">
        <h1 className="font-display text-5xl text-app-text">Деталі замовлення</h1>
        <p className="text-app-secondary">
          Тут зберігається історія переписки з психологом або адміністратором по замовленню.
        </p>
        <div className="rounded-[var(--radius-lg)] border border-app-border bg-app-surface p-6 shadow-soft">
          <p className="text-sm text-app-secondary">Статус: {view.statusLabel}</p>
          <p className="mt-2 text-sm text-app-secondary">{view.resultStateLabel}</p>
        </div>
        <OrderMessageThread messages={messages} />
      </div>
    </section>
  );
}
