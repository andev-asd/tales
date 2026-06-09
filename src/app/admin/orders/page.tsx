import Link from 'next/link';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/src/components/layout/dashboard-shell';
import { getCurrentSession } from '@/src/lib/auth';
import { db } from '@/src/lib/db';
import { getAdminOrders } from '@/src/server/queries/admin-orders';
import { OrderStatusBadge } from '@/src/components/orders/order-status-badge';
import { mapOrderForView } from '@/src/lib/customer-data';

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams?: Promise<{ status?: string }>;
};

const adminItems = [
  { href: '/admin/users', label: 'Користувачі' },
  { href: '/admin/tales', label: 'Керування книгами' },
  { href: '/admin/categories', label: 'Категорії' },
  { href: '/admin/orders', label: 'Замовлення' },
];

const statuses = ['ALL', 'NEW', 'IN_REVIEW', 'IN_PROGRESS', 'AWAITING_CUSTOMER', 'COMPLETED', 'CANCELLED'];

const statusLabels: Record<string, string> = {
  ALL: 'Всі',
  NEW: 'Нові',
  IN_REVIEW: 'На розгляді',
  IN_PROGRESS: 'У роботі',
  AWAITING_CUSTOMER: 'Очікує клієнта',
  COMPLETED: 'Завершено',
  CANCELLED: 'Скасовано',
};

const paymentStatusLabels: Record<string, string> = {
  PENDING: 'Очікує оплати',
  APPROVED: 'Оплачено',
  DECLINED: 'Відхилено',
  EXPIRED: 'Прострочено',
};

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const currentStatus = params.status ?? 'ALL';

  const session = await getCurrentSession().catch(() => null);
  const appUser = session?.user?.email
    ? await db.user.findUnique({
        where: { email: session.user.email },
        select: { role: true },
      })
    : null;

  if (appUser?.role !== 'ADMIN' && appUser?.role !== 'SUPERADMIN') {
    redirect('/login');
  }

  const orders = await getAdminOrders({ status: currentStatus });

  return (
    <DashboardShell title="Адмінка" items={adminItems}>
      <div className="space-y-6">
        <h1 className="font-display text-4xl text-app-text">Замовлення</h1>

        <div className="flex flex-wrap gap-2">
          {statuses.map((s) => (
            <Link
              key={s}
              href={`/admin/orders${s === 'ALL' ? '' : `?status=${s}`}`}
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                currentStatus === s
                  ? 'bg-app-accent text-white'
                  : 'border border-app-border text-app-secondary hover:text-app-text'
              }`}
            >
              {statusLabels[s]}
            </Link>
          ))}
        </div>

        {orders.length === 0 ? (
          <p className="text-app-secondary">Замовлень не знайдено.</p>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => {
              const view = mapOrderForView({
                type: order.type as 'READY_TALE' | 'PERSONALIZED_TEMPLATE' | 'CUSTOM_PSYCHOLOGIST',
                status: order.status as 'NEW' | 'IN_REVIEW' | 'IN_PROGRESS' | 'AWAITING_CUSTOMER' | 'COMPLETED' | 'CANCELLED',
              });
              const paymentLabel = order.payment?.status
                ? (paymentStatusLabels[order.payment.status] ?? order.payment.status)
                : '—';
              const amount = order.payment?.amount ?? order.tale?.price ?? null;
              const createdDate = order.createdAt.toLocaleDateString('uk-UA');

              return (
                <div
                  key={order.id}
                  className="rounded-[var(--radius-lg)] border border-app-border bg-app-surface p-6 shadow-soft"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="font-medium text-app-text">
                        {order.customer?.name ?? '—'}{' '}
                        <span className="text-sm text-app-secondary">
                          {order.customer?.email ?? ''}
                        </span>
                      </p>
                      <p className="text-sm text-app-secondary">
                        {order.tale?.title ?? '—'}
                      </p>
                      <p className="text-sm text-app-secondary">{view.typeLabel}</p>
                      <p className="text-sm text-app-secondary">{paymentLabel}</p>
                      <p className="text-sm text-app-secondary">
                        {amount != null ? `${amount} грн` : '—'}
                      </p>
                      <p className="text-sm text-app-secondary">{createdDate}</p>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <OrderStatusBadge label={view.statusLabel} />
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="rounded-md bg-app-accent px-4 py-1.5 text-sm font-medium text-white hover:opacity-90"
                      >
                        Відкрити
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
