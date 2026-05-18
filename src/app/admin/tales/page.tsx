import Link from 'next/link';
import { mapAdminTaleForView } from '@/src/lib/admin-tale-view';
import { DashboardShell } from '@/src/components/layout/dashboard-shell';
import { getAdminTales } from '@/src/server/queries/admin';

type AdminTale = Awaited<ReturnType<typeof getAdminTales>>[number];

export const dynamic = 'force-dynamic';

export default async function AdminTalesPage() {
  const tales = await getAdminTales();

  return (
    <DashboardShell
      title="Адмін"
      items={[
        { href: '/admin/users', label: 'Користувачі' },
        { href: '/admin/tales', label: 'Керування казками' },
        { href: '/admin/categories', label: 'Категорії' },
        { href: '/admin/orders', label: 'Замовлення' },
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="font-display text-4xl text-app-text">Казки</h1>
          <Link
            href="/admin/tales/new"
            className="rounded-full bg-app-accent px-4 py-2 text-sm font-medium text-white"
          >
            Нова казка
          </Link>
        </div>
        <div className="grid gap-4">
          {tales.map((tale: AdminTale) => {
            const view = mapAdminTaleForView(tale);
            const categoryNames = tale.categories.map((item: AdminTale['categories'][number]) => item.category.name).join(', ');

            return (
              <div
                key={tale.id}
                className="rounded-[var(--radius-lg)] border border-app-border bg-app-surface p-6 shadow-soft"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h2 className="font-display text-2xl text-app-text">{view.title}</h2>
                      <Link href={`/admin/tales/${tale.id}`} className="text-sm font-medium text-app-accent">
                        Редагувати
                      </Link>
                    </div>
                    <p className="text-sm text-app-secondary">
                      {view.accessLabel} · {view.publishLabel}
                    </p>
                    <p className="text-sm text-app-secondary">
                      Головна: {tale.publishOnHomepage ? 'Так' : 'Ні'} · Порядок: {tale.homepageOrder}
                    </p>
                    <p className="text-sm text-app-secondary">
                      Категорії: {categoryNames || 'Не вибрано'}
                    </p>
                  </div>
                  <div className="text-right text-sm text-app-secondary">
                    <p>Ціна: {view.priceLabel}</p>
                    <p>Персоналізація: {view.personalizationPriceLabel}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardShell>
  );
}
