type UserFiltersProps = {
  selectedRole: string;
  selectedStatus: string;
};

export function UserFilters({ selectedRole, selectedStatus }: UserFiltersProps) {
  return (
    <form
      className="grid gap-4 rounded-[var(--radius-lg)] border border-app-border bg-app-surface p-4 md:grid-cols-3"
      method="get"
    >
      <label className="space-y-2 text-sm text-app-secondary">
        <span>Роль</span>
        <select
          name="role"
          defaultValue={selectedRole}
          className="w-full rounded-xl border border-app-border bg-white px-3 py-2"
        >
          <option value="ALL">Усі ролі</option>
          <option value="CUSTOMER">Користувачі</option>
          <option value="PSYCHOLOGIST">Психологи</option>
          <option value="ADMIN">Адміни</option>
          <option value="SUPERADMIN">Суперадміни</option>
        </select>
      </label>

      <label className="space-y-2 text-sm text-app-secondary">
        <span>Статус</span>
        <select
          name="status"
          defaultValue={selectedStatus}
          className="w-full rounded-xl border border-app-border bg-white px-3 py-2"
        >
          <option value="ALL">Усі статуси</option>
          <option value="ACTIVE">Активні</option>
          <option value="BLOCKED">Заблоковані</option>
        </select>
      </label>

      <div className="flex items-end">
        <button
          type="submit"
          className="rounded-full bg-app-accent px-4 py-2 text-sm font-medium text-white"
        >
          Застосувати
        </button>
      </div>
    </form>
  );
}
