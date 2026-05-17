import Link from 'next/link';

type PsychologistOrderInboxCardProps = {
  order: {
    id: string;
    status: string;
    childName: string | null;
    childAge?: number | null;
    requestNote?: string | null;
    customer: {
      name: string | null;
      email: string;
    };
  };
};

export function PsychologistOrderInboxCard({
  order,
}: PsychologistOrderInboxCardProps) {
  return (
    <article className="rounded-3xl border border-app-border bg-app-surface p-6 shadow-soft">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl text-app-text">
              {order.childName ?? 'Дитина не вказана'}
            </h2>
            <p className="text-sm text-app-secondary">
              {order.childAge === null ? 'Вік не вказано' : `${order.childAge} років`}
            </p>
          </div>
          <span className="rounded-full bg-app-accent/10 px-3 py-1 text-xs font-medium text-app-accent">
            {order.status}
          </span>
        </div>
        <p className="text-sm text-app-secondary">
          {order.customer.name ?? order.customer.email}
        </p>
        {order.requestNote ? (
          <p className="text-sm leading-6 text-app-text">{order.requestNote}</p>
        ) : null}
        <Link
          className="inline-flex rounded-full bg-app-accent px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          href={`/psychologist/orders/${order.id}`}
        >
          Відкрити замовлення
        </Link>
      </div>
    </article>
  );
}
