'use client'

import { useEffect, useRef } from 'react'

interface Props {
  formData: Record<string, string>
}

export function WayForPayForm({ formData }: Props) {
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    formRef.current?.submit()
  }, [])

  return (
    <form
      ref={formRef}
      method="POST"
      action="https://secure.wayforpay.com/pay"
    >
      {Object.entries(formData).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <noscript>
        <button type="submit">Перейти до оплати</button>
      </noscript>
    </form>
  )
}
