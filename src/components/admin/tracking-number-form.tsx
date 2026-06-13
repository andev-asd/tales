'use client'

import { useState } from 'react'
import { setTrackingNumber } from '@/src/server/actions/admin-orders'

type Props = {
  orderId: string
  currentTrackingNumber: string | null
}

export function TrackingNumberForm({ orderId, currentTrackingNumber }: Props) {
  const [value, setValue] = useState(currentTrackingNumber ?? '')
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setError('')
    const result = await setTrackingNumber(orderId, value)
    if (result.ok) {
      setStatus('ok')
    } else {
      setStatus('error')
      setError(result.error)
    }
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-app-border bg-app-surface p-6 shadow-soft space-y-4">
      <h2 className="font-medium text-app-text">Відправка книги</h2>
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm text-app-secondary mb-1">
            Номер ТТН
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => { setValue(e.target.value); setStatus('idle') }}
            placeholder="20450000000000"
            className="w-full rounded-md border border-app-border bg-app-bg px-3 py-2 text-sm text-app-text placeholder:text-app-muted focus:outline-none focus:ring-2 focus:ring-app-accent"
          />
        </div>
        <button
          type="submit"
          disabled={status === 'loading' || !value.trim()}
          className="rounded-md bg-app-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'loading' ? 'Зберігаємо…' : 'Зберегти та надіслати'}
        </button>
      </form>
      {status === 'ok' && (
        <p className="text-sm text-green-600">ТТН збережено. Листа клієнту надіслано.</p>
      )}
      {status === 'error' && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}
