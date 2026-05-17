import { notFound } from 'next/navigation';
import { mapOrderMessageForView } from '@/src/lib/customer-data';
import { DashboardShell } from '@/src/components/layout/dashboard-shell';
import { OrderMessageThread } from '@/src/components/orders/order-message-thread';
import { PsychologistOrderResultForm } from '@/src/components/psychologist/order-result-form';
import { PsychologistOrderStatusForm } from '@/src/components/psychologist/order-status-form';
import { getPsychologistOrderDetail } from '@/src/server/queries/psychologist';

export const dynamic = 'force-dynamic';

export default async function PsychologistOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getPsychologistOrderDetail(id);

  if (!order) {
    notFound();
  }

  const messages = order.messages.map(mapOrderMessageForView);

  return (
    <DashboardShell
      title="Психолог"
      items={[{ href: '/psychologist', label: 'Мої замовлення' }]}
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="font-display text-4xl text-app-text">Замовлення психолога</h1>
          <p className="text-sm text-app-secondary">
            Клієнт: {order.customer.name ?? order.customer.email}
          </p>
          <p className="text-sm text-app-secondary">
            Статус: {order.status}
          </p>
          <p className="text-sm text-app-secondary">
            Brief: {order.brief ?? 'Не вказано'}
          </p>
        </div>
        <PsychologistOrderStatusForm currentStatus={order.status} />
        <PsychologistOrderResultForm
          defaultValues={{
            resultTitle: order.resultTitle,
            resultBody: order.resultBody,
          }}
        />
        <OrderMessageThread messages={messages} />
      </div>
    </DashboardShell>
  );
}
