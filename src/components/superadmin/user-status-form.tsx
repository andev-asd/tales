import type { UserStatus } from '@/src/lib/user-types';

import { getUserStatusLabel } from '@/src/lib/user-access';

type UserStatusFormProps = {
  userId: string;
  currentStatus: UserStatus;
};

export function UserStatusForm({
  userId,
  currentStatus,
}: UserStatusFormProps) {
  const nextStatus = currentStatus === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED';

  return (
    <form className="grid gap-2 rounded-[var(--radius-lg)] border border-app-border p-4">
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="status" value={nextStatus} />
      <p className="text-sm text-app-secondary">
        Поточний статус: {getUserStatusLabel(currentStatus)}
      </p>
      <button
        type="submit"
        className="rounded-full bg-app-accent px-4 py-2 text-sm font-medium text-white"
      >
        {currentStatus === 'BLOCKED' ? 'Розблокувати' : 'Заблокувати'}
      </button>
    </form>
  );
}
