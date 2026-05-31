import { DashboardShell } from '@/src/components/layout/dashboard-shell';
import { AdminUserFilters } from '@/src/components/admin/user-filters';
import { AdminUserManagementTable } from '@/src/components/admin/user-management-table';
import { getCurrentSession } from '@/src/lib/auth';
import { db } from '@/src/lib/db';
import { getAdminUsers } from '@/src/server/queries/admin-users';
import { getSuperadminUsers } from '@/src/server/queries/superadmin';

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams?: Promise<{ role?: string; status?: string }>;
};

const adminItems = [
  { href: '/admin/users', label: 'Користувачі' },
  { href: '/admin/tales', label: 'Керування книгами' },
  { href: '/admin/categories', label: 'Категорії' },
  { href: '/admin/orders', label: 'Переписка з клієнтом' },
];

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const role = params.role ?? 'ALL';
  const status = params.status ?? 'ALL';
  const session = await getCurrentSession().catch(() => null);
  const appUser = session?.user?.email
    ? await db.user.findUnique({
        where: { email: session.user.email },
        select: { role: true },
      })
    : null;
  const actorRole = appUser?.role === 'SUPERADMIN' ? 'SUPERADMIN' : 'ADMIN';
  const users =
    actorRole === 'SUPERADMIN'
      ? await getSuperadminUsers({
          role: role as 'ALL' | 'CUSTOMER' | 'PSYCHOLOGIST' | 'ADMIN' | 'SUPERADMIN',
          status: status as 'ALL' | 'ACTIVE' | 'BLOCKED',
        })
      : await getAdminUsers({
          role: role as 'ALL' | 'CUSTOMER' | 'PSYCHOLOGIST',
          status: status as 'ALL' | 'ACTIVE' | 'BLOCKED',
        });

  return (
    <DashboardShell title="Адмінка" items={adminItems}>
      <div className="space-y-6">
        <h1 className="font-display text-4xl text-app-text">Користувачі</h1>
        <AdminUserFilters selectedRole={role} selectedStatus={status} actorRole={actorRole} />
        <AdminUserManagementTable actorRole={actorRole} users={users} />
      </div>
    </DashboardShell>
  );
}
