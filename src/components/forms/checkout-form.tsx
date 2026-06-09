'use client'

import React, { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { createOrderAction } from '@/src/server/actions/create-order'
import { deliverySchema } from '@/src/lib/validators/delivery'
import type { DeliveryInput } from '@/src/lib/validators/delivery'

type Tale = {
  id: string
  title: string
  shortDescription: string
  coverUrl: string | null
  price: number | null
}

type Props = {
  tale: Tale
}

export function CheckoutForm({ tale }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [service, setService] = React.useState<'NOVA_POSHTA' | 'UKRPOSHTA'>('NOVA_POSHTA')
  const [deliveryType, setDeliveryType] = React.useState<'BRANCH' | 'COURIER'>('BRANCH')
  const [city, setCity] = React.useState('')
  const [branchNumber, setBranchNumber] = React.useState('')
  const [street, setStreet] = React.useState('')
  const [house, setHouse] = React.useState('')
  const [apartment, setApartment] = React.useState('')
  const [recipientName, setRecipientName] = React.useState('')
  const [recipientPhone, setRecipientPhone] = React.useState('+380')
  const [error, setError] = React.useState<string | null>(null)

  function handleServiceChange(value: 'NOVA_POSHTA' | 'UKRPOSHTA') {
    setService(value)
    if (value === 'UKRPOSHTA') {
      setDeliveryType('BRANCH')
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const effectiveDeliveryType = service === 'UKRPOSHTA' ? 'BRANCH' : deliveryType

    const delivery: DeliveryInput = {
      service,
      deliveryType: effectiveDeliveryType,
      city,
      branchNumber: effectiveDeliveryType === 'BRANCH' ? branchNumber : undefined,
      street: effectiveDeliveryType === 'COURIER' ? street : undefined,
      house: effectiveDeliveryType === 'COURIER' ? house : undefined,
      apartment: effectiveDeliveryType === 'COURIER' ? apartment : undefined,
      recipientName,
      recipientPhone,
    }

    const validation = deliverySchema.safeParse(delivery)
    if (!validation.success) {
      setError(validation.error.issues[0]?.message ?? 'Помилка валідації')
      return
    }

    startTransition(async () => {
      const result = await createOrderAction(tale.id, validation.data)
      if (result.ok) {
        router.push('/orders/' + result.orderId)
      } else {
        setError(result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Tale summary */}
      <div className="rounded-lg border border-app-border bg-app-elevated p-4">
        <p className="font-semibold">{tale.title}</p>
        <p className="mt-1 text-sm text-app-muted">
          {tale.price !== null ? `${tale.price} грн` : 'Ціна уточнюється'}
        </p>
      </div>

      {/* Delivery service */}
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 font-medium">Служба доставки</legend>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="service"
            value="NOVA_POSHTA"
            checked={service === 'NOVA_POSHTA'}
            onChange={() => handleServiceChange('NOVA_POSHTA')}
          />
          Нова Пошта
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="service"
            value="UKRPOSHTA"
            checked={service === 'UKRPOSHTA'}
            onChange={() => handleServiceChange('UKRPOSHTA')}
          />
          Укрпошта
        </label>
      </fieldset>

      {/* Delivery type */}
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 font-medium">Спосіб доставки</legend>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="deliveryType"
            value="BRANCH"
            checked={deliveryType === 'BRANCH'}
            onChange={() => setDeliveryType('BRANCH')}
          />
          Відділення / поштомат
        </label>

        {service === 'NOVA_POSHTA' && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="deliveryType"
              value="COURIER"
              checked={deliveryType === 'COURIER'}
              onChange={() => setDeliveryType('COURIER')}
            />
            Кур'єр
          </label>
        )}
      </fieldset>

      {/* City */}
      <div className="space-y-1">
        <label htmlFor="city" className="block text-sm font-medium text-app-text">Місто *</label>
        <Input
          id="city"
          type="text"
          placeholder="Місто"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
      </div>

      {/* Branch number or address fields */}
      {deliveryType === 'BRANCH' ? (
        <div className="space-y-1">
          <label htmlFor="branchNumber" className="block text-sm font-medium text-app-text">Відділення *</label>
          <Input
            id="branchNumber"
            type="text"
            placeholder="Номер відділення"
            value={branchNumber}
            onChange={(e) => setBranchNumber(e.target.value)}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="space-y-1">
            <label htmlFor="street" className="block text-sm font-medium text-app-text">Вулиця *</label>
            <Input
              id="street"
              type="text"
              placeholder="Наприклад: Хрещатик"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="house" className="block text-sm font-medium text-app-text">Будинок *</label>
            <Input
              id="house"
              type="text"
              placeholder="Будинок"
              value={house}
              onChange={(e) => setHouse(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="apartment" className="block text-sm font-medium text-app-text">Квартира</label>
            <Input
              id="apartment"
              type="text"
              placeholder="Квартира (необов'язково)"
              value={apartment}
              onChange={(e) => setApartment(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Recipient info */}
      <div className="space-y-1">
        <label htmlFor="recipientName" className="block text-sm font-medium text-app-text">ПІБ отримувача *</label>
        <Input
          id="recipientName"
          type="text"
          placeholder="ПІБ отримувача"
          value={recipientName}
          onChange={(e) => setRecipientName(e.target.value)}
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="recipientPhone" className="block text-sm font-medium text-app-text">Телефон *</label>
        <Input
          id="recipientPhone"
          type="tel"
          placeholder="+380XXXXXXXXX"
          value={recipientPhone}
          onChange={(e) => setRecipientPhone(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" disabled={isPending}>
        Підтвердити замовлення
      </Button>
    </form>
  )
}
