import type { OrderStatus } from '@/src/lib/user-types';

const optionsByStatus: Record<OrderStatus, OrderStatus[]> = {
  NEW: ['IN_REVIEW'],
  IN_REVIEW: ['IN_PROGRESS'],
  IN_PROGRESS: ['AWAITING_CUSTOMER', 'COMPLETED'],
  AWAITING_CUSTOMER: ['IN_PROGRESS', 'COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
};

export function PsychologistOrderStatusForm({
  currentStatus,
}: {
  currentStatus: OrderStatus;
}) {
  const options = optionsByStatus[currentStatus];

  if (options.length === 0) {
    return null;
  }

  return (
    <form className="grid gap-3 rounded-[var(--radius-lg)] border border-app-border bg-app-surface p-6 shadow-soft">
      <label className="text-sm text-app-secondary">Робочий статус</label>
      <select
        name="status"
        defaultValue={options[0]}
        className="rounded-xl border border-app-border bg-white px-3 py-2"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="rounded-full bg-app-accent px-4 py-2 text-sm font-medium text-white"
      >
        Оновити статус
      </button>
    </form>
  );
}
