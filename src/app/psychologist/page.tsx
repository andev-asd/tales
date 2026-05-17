import { PsychologistOrderInboxCard } from '@/src/components/psychologist/order-inbox-card';
import { DashboardShell } from '@/src/components/layout/dashboard-shell';
import { getPsychologistInbox } from '@/src/server/queries/psychologist';

type PsychologistOrder = Awaited<ReturnType<typeof getPsychologistInbox>>[number];

export const dynamic = 'force-dynamic';

export default async function PsychologistPage() {
  const orders = await getPsychologistInbox();

  return (
    <DashboardShell
      title="Психолог"
      items={[{ href: '/psychologist', label: 'Мої замовлення' }]}
    >
      <div className="space-y-6">
        <h1 className="font-display text-4xl text-app-text">
          Мої індивідуальні замовлення
        </h1>
        <div className="grid gap-4">
          {orders.map((order: PsychologistOrder) => (
            <PsychologistOrderInboxCard key={order.id} order={order} />
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
