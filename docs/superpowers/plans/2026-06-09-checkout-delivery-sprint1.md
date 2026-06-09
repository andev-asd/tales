# Checkout + Delivery Sprint 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `/checkout?slug=` page where authenticated clients fill in a delivery form, creating an `Order` + `Delivery` in the database. Both "Оформити замовлення" and "Замовити друк" buttons wire to this page.

**Architecture:** Data layer first (schema → validator → query → action), then UI (form component → page → button wiring). Each task is independently shippable. No payment in this sprint — orders land with status `NEW`.

**Tech Stack:** Next.js 16 App Router, Prisma + PostgreSQL, Zod validation, React 19 client components, Better Auth (`getCurrentSession`), Vitest + React Testing Library.

---

## File Map

| Action | File |
|--------|------|
| Modify | `prisma/schema.prisma` |
| Create | `src/lib/validators/delivery.ts` |
| Create | `src/lib/validators/delivery.test.ts` |
| Create | `src/server/queries/checkout.ts` |
| Create | `src/server/actions/create-order.ts` |
| Create | `src/components/forms/checkout-form.tsx` |
| Create | `src/components/forms/checkout-form.test.tsx` |
| Create | `src/app/checkout/page.tsx` |
| Modify | `src/components/tales/tale-actions.tsx` |
| Modify | `src/features/editor/Toolbar.tsx` |
| Modify | `src/features/editor/Editor.tsx` |
| Modify | `src/app/editor/page.tsx` |

---

### Task 1: Prisma schema — Delivery model + migration

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add enums and Delivery model to `prisma/schema.prisma`**

Add the two new enums right before or after the existing `OrderType` enum:

```prisma
enum DeliveryService {
  NOVA_POSHTA
  UKRPOSHTA
}

enum DeliveryType {
  BRANCH
  COURIER
}
```

Add the `Delivery` model after the `Order` model:

```prisma
model Delivery {
  id             String          @id @default(cuid())
  orderId        String          @unique
  order          Order           @relation(fields: [orderId], references: [id], onDelete: Cascade)
  service        DeliveryService
  deliveryType   DeliveryType
  city           String
  branchNumber   String?
  street         String?
  house          String?
  apartment      String?
  recipientName  String
  recipientPhone String
  createdAt      DateTime        @default(now())
}
```

Add `delivery Delivery?` to the `Order` model (after the `messages` field):

```prisma
model Order {
  ...existing fields...
  messages       OrderMessage[]
  libraryItems   LibraryItem[]
  delivery       Delivery?
}
```

- [ ] **Step 2: Run migration**

```bash
cd /Users/andrew/Projects/tales && npx prisma migrate dev --name add-delivery
```

Expected: migration file created, schema applied, no errors.

- [ ] **Step 3: Verify generated types**

```bash
npx prisma generate
```

Expected: Prisma Client regenerated, `DeliveryService`, `DeliveryType`, `Delivery` types available.

- [ ] **Step 4: TypeScript check**

```bash
npm run typecheck
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: add Delivery model and enums to Prisma schema"
```

---

### Task 2: Zod delivery validator (TDD)

**Files:**
- Create: `src/lib/validators/delivery.ts`
- Create: `src/lib/validators/delivery.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/validators/delivery.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { deliverySchema } from './delivery'

describe('deliverySchema', () => {
  const validBranch = {
    service: 'NOVA_POSHTA' as const,
    deliveryType: 'BRANCH' as const,
    city: 'Київ',
    branchNumber: '47',
    recipientName: 'Іванов Іван Іванович',
    recipientPhone: '+380991234567',
  }

  it('accepts valid BRANCH delivery for Нова Пошта', () => {
    expect(deliverySchema.safeParse(validBranch).success).toBe(true)
  })

  it('accepts valid BRANCH delivery for Укрпошта', () => {
    const result = deliverySchema.safeParse({ ...validBranch, service: 'UKRPOSHTA' })
    expect(result.success).toBe(true)
  })

  it('accepts valid COURIER delivery', () => {
    const result = deliverySchema.safeParse({
      service: 'NOVA_POSHTA',
      deliveryType: 'COURIER',
      city: 'Київ',
      street: 'Хрещатик',
      house: '1',
      recipientName: 'Іванов Іван Іванович',
      recipientPhone: '+380991234567',
    })
    expect(result.success).toBe(true)
  })

  it('accepts COURIER delivery with optional apartment', () => {
    const result = deliverySchema.safeParse({
      service: 'NOVA_POSHTA',
      deliveryType: 'COURIER',
      city: 'Київ',
      street: 'Хрещатик',
      house: '1',
      apartment: '47',
      recipientName: 'Іванов Іван Іванович',
      recipientPhone: '+380991234567',
    })
    expect(result.success).toBe(true)
  })

  it('rejects COURIER for UKRPOSHTA', () => {
    const result = deliverySchema.safeParse({
      ...validBranch,
      service: 'UKRPOSHTA',
      deliveryType: 'COURIER',
      street: 'Хрещатик',
      house: '1',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'))
      expect(paths).toContain('deliveryType')
    }
  })

  it('rejects BRANCH without branchNumber', () => {
    const { branchNumber: _, ...rest } = validBranch
    const result = deliverySchema.safeParse(rest)
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'))
      expect(paths).toContain('branchNumber')
    }
  })

  it('rejects COURIER without street', () => {
    const result = deliverySchema.safeParse({
      service: 'NOVA_POSHTA',
      deliveryType: 'COURIER',
      city: 'Київ',
      house: '1',
      recipientName: 'Іванов Іван Іванович',
      recipientPhone: '+380991234567',
    })
    expect(result.success).toBe(false)
  })

  it('rejects COURIER without house', () => {
    const result = deliverySchema.safeParse({
      service: 'NOVA_POSHTA',
      deliveryType: 'COURIER',
      city: 'Київ',
      street: 'Хрещатик',
      recipientName: 'Іванов Іван Іванович',
      recipientPhone: '+380991234567',
    })
    expect(result.success).toBe(false)
  })

  it('rejects phone not matching +380XXXXXXXXX', () => {
    const result = deliverySchema.safeParse({ ...validBranch, recipientPhone: '0991234567' })
    expect(result.success).toBe(false)
  })

  it('rejects city shorter than 2 characters', () => {
    const result = deliverySchema.safeParse({ ...validBranch, city: 'К' })
    expect(result.success).toBe(false)
  })

  it('rejects recipientName shorter than 2 characters', () => {
    const result = deliverySchema.safeParse({ ...validBranch, recipientName: 'І' })
    expect(result.success).toBe(false)
  })
})
```

- [ ] **Step 2: Run tests — expect all failures**

```bash
cd /Users/andrew/Projects/tales && npm run test -- --reporter=verbose src/lib/validators/delivery.test.ts
```

Expected: all tests FAIL with import error ("Cannot find module './delivery'").

- [ ] **Step 3: Implement `src/lib/validators/delivery.ts`**

```ts
import { z } from 'zod'

export const deliverySchema = z
  .object({
    service: z.enum(['NOVA_POSHTA', 'UKRPOSHTA']),
    deliveryType: z.enum(['BRANCH', 'COURIER']),
    city: z.string().min(2, 'Вкажіть місто'),
    branchNumber: z.string().optional(),
    street: z.string().optional(),
    house: z.string().optional(),
    apartment: z.string().optional(),
    recipientName: z.string().min(2, 'Вкажіть ПІБ отримувача'),
    recipientPhone: z
      .string()
      .regex(/^\+380\d{9}$/, 'Телефон у форматі +380XXXXXXXXX'),
  })
  .superRefine((data, ctx) => {
    if (data.deliveryType === 'COURIER' && data.service !== 'NOVA_POSHTA') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['deliveryType'],
        message: "Кур'єрська доставка доступна тільки для Нової Пошти",
      })
    }
    if (data.deliveryType === 'BRANCH' && !data.branchNumber?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['branchNumber'],
        message: 'Вкажіть номер відділення',
      })
    }
    if (data.deliveryType === 'COURIER') {
      if (!data.street?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['street'],
          message: 'Вкажіть вулицю',
        })
      }
      if (!data.house?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['house'],
          message: 'Вкажіть будинок',
        })
      }
    }
  })

export type DeliveryInput = z.infer<typeof deliverySchema>
```

- [ ] **Step 4: Run tests — expect all pass**

```bash
npm run test -- --reporter=verbose src/lib/validators/delivery.test.ts
```

Expected: all 11 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/validators/delivery.ts src/lib/validators/delivery.test.ts
git commit -m "feat: add Zod delivery validator with tests"
```

---

### Task 3: Checkout query

**Files:**
- Create: `src/server/queries/checkout.ts`

- [ ] **Step 1: Create `src/server/queries/checkout.ts`**

```ts
import { db } from '@/src/lib/db'
import { getPublicImageUrl } from '@/src/lib/storage'

export async function getCheckoutTaleBySlug(slug: string) {
  const tale = await db.tale.findFirst({
    where: { slug, published: true },
    select: {
      id: true,
      title: true,
      slug: true,
      shortDescription: true,
      accessType: true,
      price: true,
      coverPath: true,
    },
  })

  if (!tale) return null

  return {
    ...tale,
    coverUrl: tale.coverPath ? getPublicImageUrl(tale.coverPath) : null,
  }
}
```

- [ ] **Step 2: TypeScript check**

```bash
cd /Users/andrew/Projects/tales && npm run typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/server/queries/checkout.ts
git commit -m "feat: add getCheckoutTaleBySlug query"
```

---

### Task 4: Server action — createOrderAction

**Files:**
- Create: `src/server/actions/create-order.ts`

- [ ] **Step 1: Create `src/server/actions/create-order.ts`**

```ts
'use server'

import { getCurrentSession } from '@/src/lib/auth'
import { db } from '@/src/lib/db'
import { deliverySchema, type DeliveryInput } from '@/src/lib/validators/delivery'

export type CreateOrderResult =
  | { ok: true; orderId: string }
  | { ok: false; error: string }

export async function createOrderAction(
  taleId: string,
  delivery: DeliveryInput,
): Promise<CreateOrderResult> {
  const session = await getCurrentSession()

  if (!session?.user?.email) {
    return { ok: false, error: 'Увійдіть, щоб оформити замовлення' }
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  })

  if (!user) {
    return { ok: false, error: 'Користувача не знайдено' }
  }

  const parsed = deliverySchema.safeParse(delivery)
  if (!parsed.success) {
    return { ok: false, error: 'Невірні дані доставки' }
  }

  const tale = await db.tale.findUnique({
    where: { id: taleId, published: true },
    select: { accessType: true },
  })

  if (!tale) {
    return { ok: false, error: 'Казку не знайдено' }
  }

  const orderType =
    tale.accessType === 'PERSONALIZABLE' ? 'PERSONALIZED_TEMPLATE' : 'READY_TALE'

  const order = await db.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        type: orderType,
        customerId: user.id,
        taleId,
      },
    })

    await tx.delivery.create({
      data: {
        orderId: newOrder.id,
        service: parsed.data.service,
        deliveryType: parsed.data.deliveryType,
        city: parsed.data.city,
        branchNumber: parsed.data.branchNumber ?? null,
        street: parsed.data.street ?? null,
        house: parsed.data.house ?? null,
        apartment: parsed.data.apartment ?? null,
        recipientName: parsed.data.recipientName,
        recipientPhone: parsed.data.recipientPhone,
      },
    })

    return newOrder
  })

  return { ok: true, orderId: order.id }
}
```

- [ ] **Step 2: TypeScript check**

```bash
cd /Users/andrew/Projects/tales && npm run typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/server/actions/create-order.ts
git commit -m "feat: add createOrderAction server action"
```

---

### Task 5: CheckoutForm component (TDD)

**Files:**
- Create: `src/components/forms/checkout-form.tsx`
- Create: `src/components/forms/checkout-form.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `src/components/forms/checkout-form.test.tsx`:

```tsx
import React from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CheckoutForm } from './checkout-form'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('@/src/server/actions/create-order', () => ({
  createOrderAction: vi.fn().mockResolvedValue({ ok: true, orderId: 'order-1' }),
}))

const tale = {
  id: 'tale-1',
  title: 'Казка про зайченя',
  shortDescription: 'Чудова казка',
  coverUrl: null,
  price: 350,
}

describe('CheckoutForm', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('renders service radio buttons', () => {
    render(<CheckoutForm tale={tale} />)
    expect(screen.getByRole('radio', { name: 'Нова Пошта' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Укрпошта' })).toBeInTheDocument()
  })

  it('renders delivery type radio buttons', () => {
    render(<CheckoutForm tale={tale} />)
    expect(screen.getByRole('radio', { name: 'Відділення / поштомат' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: "Кур'єр" })).toBeInTheDocument()
  })

  it('hides Кур\'єр option when Укрпошта is selected', async () => {
    const user = userEvent.setup()
    render(<CheckoutForm tale={tale} />)

    await user.click(screen.getByRole('radio', { name: 'Укрпошта' }))

    expect(screen.queryByRole('radio', { name: "Кур'єр" })).not.toBeInTheDocument()
  })

  it('shows branch number field by default (BRANCH type)', () => {
    render(<CheckoutForm tale={tale} />)
    expect(screen.getByPlaceholderText(/номер відділення/i)).toBeInTheDocument()
  })

  it('shows address fields when Кур\'єр is selected', async () => {
    const user = userEvent.setup()
    render(<CheckoutForm tale={tale} />)

    await user.click(screen.getByRole('radio', { name: "Кур'єр" }))

    expect(screen.getByPlaceholderText(/хрещатик/i)).toBeInTheDocument()
    expect(screen.queryByPlaceholderText(/номер відділення/i)).not.toBeInTheDocument()
  })

  it('shows tale title and price', () => {
    render(<CheckoutForm tale={tale} />)
    expect(screen.getByText('Казка про зайченя')).toBeInTheDocument()
    expect(screen.getByText('350 грн')).toBeInTheDocument()
  })

  it('shows "Ціна уточнюється" when price is null', () => {
    render(<CheckoutForm tale={{ ...tale, price: null }} />)
    expect(screen.getByText('Ціна уточнюється')).toBeInTheDocument()
  })

  it('renders submit button', () => {
    render(<CheckoutForm tale={tale} />)
    expect(screen.getByRole('button', { name: 'Підтвердити замовлення' })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests — expect failures**

```bash
cd /Users/andrew/Projects/tales && npm run test -- --reporter=verbose src/components/forms/checkout-form.test.tsx
```

Expected: all tests FAIL ("Cannot find module './checkout-form'").

- [ ] **Step 3: Create `src/components/forms/checkout-form.tsx`**

```tsx
'use client'

import { type FormEvent, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { createOrderAction } from '@/src/server/actions/create-order'
import type { DeliveryInput } from '@/src/lib/validators/delivery'

type CheckoutTale = {
  id: string
  title: string
  shortDescription: string
  coverUrl: string | null
  price: number | null
}

type DeliveryService = 'NOVA_POSHTA' | 'UKRPOSHTA'
type DeliveryType = 'BRANCH' | 'COURIER'

type CheckoutFormProps = {
  tale: CheckoutTale
}

export function CheckoutForm({ tale }: CheckoutFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [service, setService] = useState<DeliveryService>('NOVA_POSHTA')
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('BRANCH')
  const [city, setCity] = useState('')
  const [branchNumber, setBranchNumber] = useState('')
  const [street, setStreet] = useState('')
  const [house, setHouse] = useState('')
  const [apartment, setApartment] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [recipientPhone, setRecipientPhone] = useState('+380')

  const handleServiceChange = (newService: DeliveryService) => {
    setService(newService)
    if (newService === 'UKRPOSHTA' && deliveryType === 'COURIER') {
      setDeliveryType('BRANCH')
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    const delivery: DeliveryInput =
      deliveryType === 'BRANCH'
        ? { service, deliveryType: 'BRANCH', city, branchNumber, recipientName, recipientPhone }
        : {
            service: 'NOVA_POSHTA',
            deliveryType: 'COURIER',
            city,
            street,
            house,
            apartment: apartment || undefined,
            recipientName,
            recipientPhone,
          }

    startTransition(async () => {
      const result = await createOrderAction(tale.id, delivery)
      if (result.ok) {
        router.push(`/orders/${result.orderId}`)
      } else {
        setError(result.error)
      }
    })
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      {/* Tale card */}
      <div className="rounded-[var(--radius-lg)] border border-app-border bg-app-surface p-6 shadow-soft">
        {tale.coverUrl ? (
          <img
            src={tale.coverUrl}
            alt={tale.title}
            className="mb-4 w-full rounded-[var(--radius-md)] object-cover"
          />
        ) : null}
        <h2 className="font-display text-2xl text-app-text">{tale.title}</h2>
        <p className="mt-2 text-sm text-app-secondary">{tale.shortDescription}</p>
        {tale.price !== null ? (
          <p className="mt-4 text-lg font-medium text-app-text">{tale.price} грн</p>
        ) : (
          <p className="mt-4 text-sm text-app-secondary">Ціна уточнюється</p>
        )}
      </div>

      {/* Delivery form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Service */}
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-app-text">Служба доставки</legend>
          <div className="space-y-2">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="radio"
                name="service"
                value="NOVA_POSHTA"
                checked={service === 'NOVA_POSHTA'}
                onChange={() => handleServiceChange('NOVA_POSHTA')}
              />
              <span className="text-sm text-app-text">Нова Пошта</span>
            </label>
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="radio"
                name="service"
                value="UKRPOSHTA"
                checked={service === 'UKRPOSHTA'}
                onChange={() => handleServiceChange('UKRPOSHTA')}
              />
              <span className="text-sm text-app-text">Укрпошта</span>
            </label>
          </div>
        </fieldset>

        {/* Delivery type */}
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-app-text">Тип доставки</legend>
          <div className="space-y-2">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="radio"
                name="deliveryType"
                value="BRANCH"
                checked={deliveryType === 'BRANCH'}
                onChange={() => setDeliveryType('BRANCH')}
              />
              <span className="text-sm text-app-text">Відділення / поштомат</span>
            </label>
            {service === 'NOVA_POSHTA' ? (
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="radio"
                  name="deliveryType"
                  value="COURIER"
                  checked={deliveryType === 'COURIER'}
                  onChange={() => setDeliveryType('COURIER')}
                />
                <span className="text-sm text-app-text">Кур'єр</span>
              </label>
            ) : null}
          </div>
        </fieldset>

        {/* City */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-app-text">Місто *</label>
          <Input
            required
            placeholder="Наприклад: Київ"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>

        {/* Branch field */}
        {deliveryType === 'BRANCH' ? (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-app-text">Відділення *</label>
            <Input
              required
              placeholder="Номер відділення, напр. 47"
              value={branchNumber}
              onChange={(e) => setBranchNumber(e.target.value)}
            />
          </div>
        ) : null}

        {/* Courier fields */}
        {deliveryType === 'COURIER' ? (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-app-text">Вулиця *</label>
              <Input
                required
                placeholder="Наприклад: Хрещатик"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-app-text">Будинок *</label>
                <Input
                  required
                  placeholder="1"
                  value={house}
                  onChange={(e) => setHouse(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-app-text">Квартира</label>
                <Input
                  placeholder="47"
                  value={apartment}
                  onChange={(e) => setApartment(e.target.value)}
                />
              </div>
            </div>
          </div>
        ) : null}

        {/* Recipient */}
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-app-text">ПІБ отримувача *</label>
            <Input
              required
              placeholder="Іванов Іван Іванович"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-app-text">Телефон *</label>
            <Input
              required
              type="tel"
              placeholder="+380991234567"
              value={recipientPhone}
              onChange={(e) => setRecipientPhone(e.target.value)}
            />
          </div>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <Button type="submit" disabled={isPending}>
          {isPending ? 'Оформлення...' : 'Підтвердити замовлення'}
        </Button>
      </form>
    </div>
  )
}
```

- [ ] **Step 4: Run tests — expect all pass**

```bash
npm run test -- --reporter=verbose src/components/forms/checkout-form.test.tsx
```

Expected: all 8 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/forms/checkout-form.tsx src/components/forms/checkout-form.test.tsx
git commit -m "feat: add CheckoutForm component with delivery fields"
```

---

### Task 6: Checkout page

**Files:**
- Create: `src/app/checkout/page.tsx`

- [ ] **Step 1: Create `src/app/checkout/page.tsx`**

```tsx
import { notFound, redirect } from 'next/navigation'
import { CheckoutForm } from '@/src/components/forms/checkout-form'
import { getCheckoutTaleBySlug } from '@/src/server/queries/checkout'

export const dynamic = 'force-dynamic'

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string }>
}) {
  const { slug } = await searchParams

  if (!slug) {
    redirect('/catalog')
  }

  const tale = await getCheckoutTaleBySlug(slug)

  if (!tale) {
    notFound()
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-16 md:px-8">
      <h1 className="mb-8 font-display text-4xl text-app-text">Оформлення замовлення</h1>
      <CheckoutForm tale={tale} />
    </section>
  )
}
```

- [ ] **Step 2: TypeScript check**

```bash
cd /Users/andrew/Projects/tales && npm run typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/checkout/page.tsx
git commit -m "feat: add /checkout page"
```

---

### Task 7: Wire checkout buttons

**Files:**
- Modify: `src/components/tales/tale-actions.tsx`
- Modify: `src/features/editor/Toolbar.tsx`
- Modify: `src/features/editor/Editor.tsx`
- Modify: `src/app/editor/page.tsx`

- [ ] **Step 1: Read all four files before editing**

```bash
cat /Users/andrew/Projects/tales/src/components/tales/tale-actions.tsx
cat /Users/andrew/Projects/tales/src/features/editor/Toolbar.tsx
cat /Users/andrew/Projects/tales/src/features/editor/Editor.tsx
cat /Users/andrew/Projects/tales/src/app/editor/page.tsx
```

- [ ] **Step 2: Update `src/components/tales/tale-actions.tsx`**

Replace both dead `<Button>` elements for paid tales with `<Link>` pointing to checkout:

The PAID case — replace `<Button>Оформити замовлення</Button>` with:
```tsx
<Link
  href={`/checkout?slug=${tale.slug}`}
  className="inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium transition-colors duration-200 bg-[var(--fg-primary)] text-white hover:bg-[var(--accent-primary)]"
>
  Оформити замовлення
</Link>
```

The PERSONALIZABLE case — replace `<Button>Купити шаблон</Button>` with:
```tsx
<Link
  href={`/checkout?slug=${tale.slug}`}
  className="inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium transition-colors duration-200 bg-[var(--fg-primary)] text-white hover:bg-[var(--accent-primary)]"
>
  Купити шаблон
</Link>
```

The full updated file:

```tsx
'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { addFreeTaleToLibraryAction } from '@/src/server/actions/add-free-tale-to-library'
import { Button } from '@/src/components/ui/button'

type TaleActionsProps = {
  tale: {
    id: string
    slug: string
    accessType: 'FREE' | 'PAID' | 'PERSONALIZABLE'
  }
}

export function TaleActions({ tale }: TaleActionsProps) {
  const [notice, setNotice] = useState('')
  const [isPending, startTransition] = useTransition()

  const constructorButton = (
    <Link
      href={`/editor?slug=${tale.slug}`}
      className="inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium transition-colors duration-200 bg-transparent text-app-text ring-1 ring-app-border hover:bg-app-elevated hover:text-app-text"
    >
      Відкрити конструктор
    </Link>
  )

  if (tale.accessType === 'FREE') {
    return (
      <div className="mt-8 space-y-3">
        <div className="flex flex-wrap gap-3">
          <Button
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                const result = await addFreeTaleToLibraryAction(tale.id)
                setNotice(result.message)
              })
            }}
          >
            {isPending ? 'Додаємо...' : 'Додати в колекцію'}
          </Button>
          {constructorButton}
        </div>
        {notice ? <p className="text-sm text-app-secondary">{notice}</p> : null}
      </div>
    )
  }

  if (tale.accessType === 'PERSONALIZABLE') {
    return (
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href={`/checkout?slug=${tale.slug}`}
          className="inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium transition-colors duration-200 bg-[var(--fg-primary)] text-white hover:bg-[var(--accent-primary)]"
        >
          Купити шаблон
        </Link>
        <Button className="bg-transparent text-app-text ring-1 ring-app-border hover:bg-app-surface hover:text-app-text">
          Персоналізувати ім&apos;ям
        </Button>
        {constructorButton}
      </div>
    )
  }

  return (
    <div className="mt-8 flex flex-wrap gap-3">
      <Link
        href={`/checkout?slug=${tale.slug}`}
        className="inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium transition-colors duration-200 bg-[var(--fg-primary)] text-white hover:bg-[var(--accent-primary)]"
      >
        Оформити замовлення
      </Link>
      {constructorButton}
    </div>
  )
}
```

- [ ] **Step 3: Update `src/features/editor/Toolbar.tsx` — add `taleSlug` prop**

Replace the entire file:

```tsx
import Link from 'next/link'

type ToolbarProps = {
  readOnly?: boolean
  taleSlug?: string
  onAddPage: () => void
}

export const Toolbar = ({ readOnly, taleSlug, onAddPage }: ToolbarProps) => (
  <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
    <div className="text-sm font-medium text-slate-900">Конструктор казки</div>
    <div className="flex items-center gap-3">
      {!readOnly ? (
        <button
          type="button"
          onClick={onAddPage}
          className="rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
        >
          Додати сторінку
        </button>
      ) : null}
      <Link
        href={taleSlug ? `/checkout?slug=${taleSlug}` : '/catalog'}
        className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
      >
        Замовити друк
      </Link>
    </div>
  </div>
)
```

- [ ] **Step 4: Update `src/features/editor/Editor.tsx` — add `taleSlug` prop through the chain**

Read the current `Editor.tsx`. Add `taleSlug?: string` to `EditorProps` and pass it through `EditorShell` → `Toolbar`.

The `EditorProps` type gets one new field:
```ts
type EditorProps = {
  initialDocument?: EditorDocument
  onChange?: (document: EditorDocument) => void
  readOnly?: boolean
  className?: string
  taleSlug?: string   // ← new
}
```

`EditorShell` picks up `taleSlug` from its props and passes it to `<Toolbar>`:

```tsx
const EditorShell = ({ readOnly, className, taleSlug }: Pick<EditorProps, 'readOnly' | 'className' | 'taleSlug'>) => {
```

And in the JSX:
```tsx
<Toolbar readOnly={readOnly} taleSlug={taleSlug} onAddPage={handleAddPage} />
```

The `Editor` export passes `taleSlug` to `EditorShell`:
```tsx
export const Editor = ({ initialDocument, onChange, readOnly, className, taleSlug }: EditorProps) => {
  const document = initialDocument ?? createDefaultDocument()

  return (
    <EditorProvider initialDocument={document} onChange={onChange}>
      <EditorShell readOnly={readOnly} className={className} taleSlug={taleSlug} />
    </EditorProvider>
  )
}
```

- [ ] **Step 5: Update `src/app/editor/page.tsx` — pass slug to Editor**

Add `taleSlug={slug}` to the `<Editor>` component:

```tsx
<Editor
  initialDocument={initialDocument}
  className="min-h-[720px]"
  taleSlug={slug}
/>
```

- [ ] **Step 6: TypeScript check**

```bash
cd /Users/andrew/Projects/tales && npm run typecheck
```

Expected: no errors.

- [ ] **Step 7: Run all tests**

```bash
npm run test
```

Expected: all previously passing tests still pass. The editor tests do not reference "Замовити друк" href so no updates needed there.

- [ ] **Step 8: Commit**

```bash
git add src/components/tales/tale-actions.tsx src/features/editor/Toolbar.tsx src/features/editor/Editor.tsx src/app/editor/page.tsx
git commit -m "feat: wire Оформити замовлення and Замовити друк buttons to /checkout"
```
