import { DashboardShell } from '@/src/components/layout/dashboard-shell';
import { UserFilters } from '@/src/components/superadmin/user-filters';
import { UserManagementTable } from '@/src/components/superadmin/user-management-table';
import { getSuperadminUsers } from '@/src/server/queries/superadmin';

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams?: Promise<{
    role?: string;
    status?: string;
  }>;
};

export default async function SuperadminUsersPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const role = params.role ?? 'ALL';
  const status = params.status ?? 'ALL';
  const users = await getSuperadminUsers({
    role: role as 'ALL' | 'CUSTOMER' | 'PSYCHOLOGIST' | 'ADMIN' | 'SUPERADMIN',
    status: status as 'ALL' | 'ACTIVE' | 'BLOCKED',
  });

  return (
    <DashboardShell
      title="Superadmin"
      items={[{ href: '/superadmin/users', label: 'Користувачі та ролі' }]}
    >
      <div className="space-y-6">
        <h1 className="font-display text-4xl text-app-text">
          Користувачі та ролі
        </h1>
        <UserFilters selectedRole={role} selectedStatus={status} />
        <UserManagementTable actorRole="SUPERADMIN" users={users} />
      </div>
    </DashboardShell>
  );
}
