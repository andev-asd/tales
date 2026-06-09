'use client'

import { useState, useTransition } from 'react'
import { updateOrderStatus } from '@/src/server/actions/admin-orders'
import { OrderStatus } from '@prisma/client'

// Allowed transitions — mirrors what the server validates
const adminTransitions: Partial<Record<OrderStatus, OrderStatus[]>> = {
  NEW: [OrderStatus.IN_REVIEW, OrderStatus.CANCELLED],
  IN_REVIEW: [OrderStatus.IN_PROGRESS, OrderStatus.CANCELLED],
  IN_PROGRESS: [OrderStatus.AWAITING_CUSTOMER, OrderStatus.COMPLETED, OrderStatus.CANCELLED],
  AWAITING_CUSTOMER: [OrderStatus.IN_PROGRESS, OrderStatus.COMPLETED, OrderStatus.CANCELLED],
}

const statusLabels: Record<OrderStatus, string> = {
  NEW: 'Нове',
  IN_REVIEW: 'На розгляді',
  IN_PROGRESS: 'У роботі',
  AWAITING_CUSTOMER: 'Очікує клієнта',
  COMPLETED: 'Завершено',
  CANCELLED: 'Скасовано',
}

interface Props {
  orderId: string
  currentStatus: OrderStatus
}

export function AdminOrderStatusForm({ orderId, currentStatus }: Props) {
  const options = adminTransitions[currentStatus] ?? []
  const [selected, setSelected] = useState(options[0] ?? '')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  if (options.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-app-border bg-app-surface p-6 shadow-soft">
        <p className="text-sm text-app-secondary">
          Статус <strong>{statusLabels[currentStatus]}</strong> — подальші переходи недоступні.
        </p>
      </div>
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, selected)
      if (!result.ok) setError(result.error)
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[var(--radius-lg)] border border-app-border bg-app-surface p-6 shadow-soft space-y-4"
    >
      <h2 className="font-medium text-app-text">Змінити статус</h2>
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value as OrderStatus)}
        className="w-full rounded-xl border border-app-border bg-white px-3 py-2 text-sm"
        disabled={isPending}
      >
        {options.map((status) => (
          <option key={status} value={status}>
            {statusLabels[status]}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-app-accent px-6 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {isPending ? 'Зберігаємо...' : 'Зберегти статус'}
      </button>
    </form>
  )
}
