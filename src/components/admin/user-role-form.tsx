import type { UserRole } from '@/src/lib/user-types';
import { getManageableRoleOptions, getUserRoleLabel } from '@/src/lib/user-access';
import { updateAdminUserRoleAction } from '@/src/server/actions/admin-users';

type AdminUserRoleFormProps = {
  userId: string;
  currentRole: UserRole;
};

export function AdminUserRoleForm({
  userId,
  currentRole,
}: AdminUserRoleFormProps) {
  const options = getManageableRoleOptions('ADMIN');

  return (
    <form action={updateAdminUserRoleAction} className="grid gap-2 rounded-[var(--radius-lg)] border border-app-border p-4">
      <input type="hidden" name="userId" value={userId} />
      <label className="text-sm text-app-secondary" htmlFor={`admin-role-${userId}`}>
        Роль
      </label>
      <select
        id={`admin-role-${userId}`}
        name="role"
        defaultValue={currentRole}
        className="rounded-xl border border-app-border bg-white px-3 py-2"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {getUserRoleLabel(option)}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="rounded-full bg-app-accent px-4 py-2 text-sm font-medium text-white"
      >
        Змінити роль
      </button>
    </form>
  );
}
