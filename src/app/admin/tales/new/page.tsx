import { TaleForm } from '@/src/components/forms/tale-form';
import { createTaleAction } from '@/src/server/actions/admin-tales';
import { DashboardShell } from '@/src/components/layout/dashboard-shell';
import { getAdminCategories } from '@/src/server/queries/admin';

export const dynamic = 'force-dynamic';

export default async function AdminNewTalePage() {
  const categories = await getAdminCategories();

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
        <h1 className="font-display text-4xl text-app-text">Нова казка</h1>
        <TaleForm action={createTaleAction} categories={categories} />
      </div>
    </DashboardShell>
  );
}
