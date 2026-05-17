import { DashboardShell } from '@/src/components/layout/dashboard-shell';
import { AdminUserFilters } from '@/src/components/admin/user-filters';
import { AdminUserManagementTable } from '@/src/components/admin/user-management-table';
import { getAdminUsers } from '@/src/server/queries/admin-users';

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams?: Promise<{ role?: string; status?: string }>;
};

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const role = params.role ?? 'ALL';
  const status = params.status ?? 'ALL';
  const users = await getAdminUsers({
    role: role as 'ALL' | 'CUSTOMER' | 'PSYCHOLOGIST',
    status: status as 'ALL' | 'ACTIVE' | 'BLOCKED',
  });

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
        <h1 className="font-display text-4xl text-app-text">Користувачі</h1>
        <AdminUserFilters selectedRole={role} selectedStatus={status} />
        <AdminUserManagementTable actorRole="ADMIN" users={users} />
      </div>
    </DashboardShell>
  );
}
