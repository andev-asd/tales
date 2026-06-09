'use client';

import React, { useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { DeliveryAutocomplete } from '@/src/components/forms/delivery-autocomplete';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import type { DeliveryAutocompleteOption } from '@/src/lib/nova-poshta-types';
import {
  deliverySchema,
  type DeliveryInput,
} from '@/src/lib/validators/delivery';
import { createOrderAction } from '@/src/server/actions/create-order';

type Tale = {
  id: string;
  title: string;
  shortDescription: string;
  coverUrl: string | null;
  price: number | null;
};

type Props = {
  tale: Tale;
};

export function CheckoutForm({ tale }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [deliveryType, setDeliveryType] = React.useState<
    'BRANCH' | 'COURIER'
  >('BRANCH');
  const [city, setCity] = React.useState('');
  const [cityRef, setCityRef] = React.useState<string | undefined>();
  const [branchNumber, setBranchNumber] = React.useState('');
  const [branchRef, setBranchRef] = React.useState<string | undefined>();
  const [street, setStreet] = React.useState('');
  const [house, setHouse] = React.useState('');
  const [apartment, setApartment] = React.useState('');
  const [recipientName, setRecipientName] = React.useState('');
  const [recipientPhone, setRecipientPhone] = React.useState('+380');
  const [error, setError] = React.useState<string | null>(null);

  function handleCityTextChange(value: string) {
    setCity(value);
    setCityRef(undefined);
    setBranchNumber('');
    setBranchRef(undefined);
  }

  function handleCitySelect(option: DeliveryAutocompleteOption) {
    setCity(option.value);
    setCityRef(option.ref);
    setBranchNumber('');
    setBranchRef(undefined);
  }

  function handleBranchTextChange(value: string) {
    setBranchNumber(value);
    setBranchRef(undefined);
  }

  function handleBranchSelect(option: DeliveryAutocompleteOption) {
    setBranchNumber(option.value);
    setBranchRef(option.ref);
  }

  function handleDeliveryTypeChange(value: 'BRANCH' | 'COURIER') {
    setDeliveryType(value);
    setBranchNumber('');
    setBranchRef(undefined);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const delivery: DeliveryInput = {
      service: 'NOVA_POSHTA',
      deliveryType,
      city,
      cityRef,
      branchNumber: deliveryType === 'BRANCH' ? branchNumber : undefined,
      branchRef: deliveryType === 'BRANCH' ? branchRef : undefined,
      street: deliveryType === 'COURIER' ? street : undefined,
      house: deliveryType === 'COURIER' ? house : undefined,
      apartment: deliveryType === 'COURIER' ? apartment : undefined,
      recipientName,
      recipientPhone,
    };

    const validation = deliverySchema.safeParse(delivery);
    if (!validation.success) {
      setError(
        validation.error.issues[0]?.message ?? 'Помилка валідації',
      );
      return;
    }

    startTransition(async () => {
      const result = await createOrderAction(tale.id, validation.data);
      if (result.ok) {
        router.push(`/orders/${result.orderId}`);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="rounded-lg border border-app-border bg-app-elevated p-4">
        <p className="font-semibold">{tale.title}</p>
        <p className="mt-1 text-sm text-app-muted">
          {tale.price !== null ? `${tale.price} грн` : 'Ціна уточнюється'}
        </p>
      </div>

      <div>
        <p className="text-sm font-medium text-app-text">Служба доставки</p>
        <p className="mt-2 text-app-text">Нова Пошта</p>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 font-medium">Спосіб доставки</legend>

        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="radio"
            name="deliveryType"
            value="BRANCH"
            checked={deliveryType === 'BRANCH'}
            onChange={() => handleDeliveryTypeChange('BRANCH')}
          />
          Відділення / поштомат
        </label>

        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="radio"
            name="deliveryType"
            value="COURIER"
            checked={deliveryType === 'COURIER'}
            onChange={() => handleDeliveryTypeChange('COURIER')}
          />
          Кур&apos;єр
        </label>
      </fieldset>

      <DeliveryAutocomplete
        id="city"
        label="Місто *"
        value={city}
        placeholder="Почніть вводити місто"
        minQueryLength={2}
        buildRequestUrl={(query) =>
          `/api/delivery/nova-poshta/cities?q=${encodeURIComponent(query)}`
        }
        onValueChange={handleCityTextChange}
        onSelect={handleCitySelect}
      />

      {deliveryType === 'BRANCH' ? (
        <DeliveryAutocomplete
          id="branchNumber"
          label="Відділення / поштомат *"
          value={branchNumber}
          placeholder={
            cityRef
              ? 'Почніть вводити номер або адресу'
              : 'Введіть відділення вручну або оберіть місто зі списку'
          }
          minQueryLength={0}
          buildRequestUrl={(query) =>
            cityRef
              ? `/api/delivery/nova-poshta/warehouses?cityRef=${encodeURIComponent(
                  cityRef,
                )}&q=${encodeURIComponent(query)}`
              : null
          }
          onValueChange={handleBranchTextChange}
          onSelect={handleBranchSelect}
        />
      ) : (
        <div className="flex flex-col gap-3">
          <div className="space-y-1">
            <label
              htmlFor="street"
              className="block text-sm font-medium text-app-text"
            >
              Вулиця *
            </label>
            <Input
              id="street"
              type="text"
              placeholder="Наприклад: Хрещатик"
              value={street}
              onChange={(event) => setStreet(event.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label
              htmlFor="house"
              className="block text-sm font-medium text-app-text"
            >
              Будинок *
            </label>
            <Input
              id="house"
              type="text"
              placeholder="Будинок"
              value={house}
              onChange={(event) => setHouse(event.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label
              htmlFor="apartment"
              className="block text-sm font-medium text-app-text"
            >
              Квартира
            </label>
            <Input
              id="apartment"
              type="text"
              placeholder="Квартира (необов'язково)"
              value={apartment}
              onChange={(event) => setApartment(event.target.value)}
            />
          </div>
        </div>
      )}

      <div className="space-y-1">
        <label
          htmlFor="recipientName"
          className="block text-sm font-medium text-app-text"
        >
          ПІБ отримувача *
        </label>
        <Input
          id="recipientName"
          type="text"
          placeholder="ПІБ отримувача"
          value={recipientName}
          onChange={(event) => setRecipientName(event.target.value)}
        />
      </div>
      <div className="space-y-1">
        <label
          htmlFor="recipientPhone"
          className="block text-sm font-medium text-app-text"
        >
          Телефон *
        </label>
        <Input
          id="recipientPhone"
          type="tel"
          placeholder="+380XXXXXXXXX"
          value={recipientPhone}
          onChange={(event) => setRecipientPhone(event.target.value)}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" disabled={isPending}>
        Підтвердити замовлення
      </Button>
    </form>
  );
}
