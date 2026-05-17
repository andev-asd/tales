import Link from 'next/link';
import { DashboardShell } from '@/src/components/layout/dashboard-shell';
import { getSuperadminSummary } from '@/src/server/queries/superadmin';

export const dynamic = 'force-dynamic';

export default async function SuperadminPage() {
  const summary = await getSuperadminSummary();

  return (
    <DashboardShell
      title="Superadmin"
      items={[{ href: '/superadmin/users', label: 'Користувачі та ролі' }]}
    >
      <div className="space-y-6">
        <h1 className="font-display text-4xl text-app-text">
          Системний контроль
        </h1>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-[var(--radius-lg)] border border-app-border bg-app-surface p-6 shadow-soft">
            Усього: {summary.totalUsers}
          </div>
          <div className="rounded-[var(--radius-lg)] border border-app-border bg-app-surface p-6 shadow-soft">
            Заблоковані: {summary.blockedUsers}
          </div>
          <div className="rounded-[var(--radius-lg)] border border-app-border bg-app-surface p-6 shadow-soft">
            Адміни: {summary.admins}
          </div>
          <div className="rounded-[var(--radius-lg)] border border-app-border bg-app-surface p-6 shadow-soft">
            Психологи: {summary.psychologists}
          </div>
        </div>
        <Link
          href="/superadmin/users"
          className="inline-flex rounded-full bg-app-accent px-5 py-3 text-sm font-medium text-white"
        >
          Перейти до керування користувачами
        </Link>
      </div>
    </DashboardShell>
  );
}
