import type { UserRole, UserStatus } from '@/src/lib/user-types';
import { getUserRoleLabel, getUserStatusLabel } from '@/src/lib/user-access';
import { AdminUserRoleForm } from './user-role-form';
import { AdminUserStatusForm } from './user-status-form';

type UserRow = {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  status: UserStatus;
};

type AdminUserManagementTableProps = {
  actorRole: UserRole;
  users: UserRow[];
};

export function AdminUserManagementTable({ users }: AdminUserManagementTableProps) {
  if (users.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-dashed border-app-border bg-app-surface p-8 text-center shadow-soft">
        <h2 className="font-display text-2xl text-app-text">Користувачів не знайдено</h2>
        <p className="mt-3 text-sm text-app-secondary">
          Спробуйте змінити фільтри або перевірити статуси ролей.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {users.map((user) => (
        <div
          key={user.id}
          className="rounded-[var(--radius-lg)] border border-app-border bg-app-surface p-6 shadow-soft"
        >
          <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr_1fr]">
            <div>
              <h2 className="font-display text-2xl text-app-text">
                {user.name ?? 'Без імені'}
              </h2>
              <p className="mt-2 text-sm text-app-secondary">{user.email}</p>
              <p className="mt-2 text-sm text-app-secondary">
                <span>{getUserRoleLabel(user.role)}</span>
                <span aria-hidden="true"> · </span>
                <span>{getUserStatusLabel(user.status)}</span>
              </p>
            </div>
            <AdminUserRoleForm userId={user.id} currentRole={user.role} />
            <AdminUserStatusForm userId={user.id} currentStatus={user.status} />
          </div>
        </div>
      ))}
    </div>
  );
}
