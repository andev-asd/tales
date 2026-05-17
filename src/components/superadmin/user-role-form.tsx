import type { UserRole } from '@/src/lib/user-types';

import { getUserRoleLabel } from '@/src/lib/user-access';

type UserRoleFormProps = {
  userId: string;
  currentRole: UserRole;
  options: readonly UserRole[];
};

export function UserRoleForm({
  userId,
  currentRole,
  options,
}: UserRoleFormProps) {
  return (
    <form className="grid gap-2 rounded-[var(--radius-lg)] border border-app-border p-4">
      <input type="hidden" name="userId" value={userId} />
      <label className="text-sm text-app-secondary" htmlFor={`role-${userId}`}>
        Роль
      </label>
      <select
        id={`role-${userId}`}
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
