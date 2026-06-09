'use client'

import { useRef, useState, useTransition } from 'react'
import { sendAdminMessage } from '@/src/server/actions/admin-orders'

interface Props {
  orderId: string
}

export function AdminOrderSendMessageForm({ orderId }: Props) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const ref = useRef<HTMLFormElement>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const body = new FormData(e.currentTarget).get('body') as string
    startTransition(async () => {
      const result = await sendAdminMessage(orderId, body)
      if (result.ok) {
        ref.current?.reset()
      } else {
        setError(result.error)
      }
    })
  }

  return (
    <form
      ref={ref}
      onSubmit={handleSubmit}
      className="rounded-[var(--radius-lg)] border border-app-border bg-app-surface p-6 shadow-soft space-y-4"
    >
      <h2 className="font-medium text-app-text">Написати клієнту</h2>
      <textarea
        name="body"
        rows={4}
        placeholder="Текст повідомлення..."
        required
        disabled={isPending}
        className="w-full rounded-xl border border-app-border bg-white px-3 py-2 text-sm resize-none"
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-app-accent px-6 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {isPending ? 'Відправляємо...' : 'Відправити'}
      </button>
    </form>
  )
}
