import { DashboardShell } from '@/src/components/layout/dashboard-shell';

export default function AdminPage() {
  return (
    <DashboardShell
      title="Адмін"
      items={[
        { href: '/admin/tales', label: 'Керування казками' },
        { href: '/admin/categories', label: 'Категорії' },
        { href: '/admin/orders', label: 'Замовлення' },
      ]}
    >
      <h1 className="font-display text-4xl text-app-text">Керування контентом</h1>
    </DashboardShell>
  );
}
