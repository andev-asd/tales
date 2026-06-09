# Checkout Delivery Sprint 2: Nova Poshta Autocomplete Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Nova Poshta city and warehouse autocomplete to checkout through server-owned proxy routes, store provider references, hide Ukrposhta, and preserve manual entry when the provider is unavailable.

**Architecture:** A server-only Nova Poshta client wraps `https://api.novaposhta.ua/v2.0/json/` and normalizes provider responses. Two Next.js route handlers expose small city and warehouse search contracts to a reusable accessible autocomplete input. Checkout stores both readable text and optional provider refs, so API failure never blocks order creation.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Prisma/PostgreSQL, Zod, Nova Poshta API 2.0, Vitest, React Testing Library.

---

## File Map

| Action | File | Responsibility |
|---|---|---|
| Modify | `.env.example` | Document `NOVA_POSHTA_API_KEY` |
| Modify | `src/lib/env.ts` | Validate the server-only key |
| Modify | `src/server/actions/assets.test.ts` | Keep test environment fixture valid |
| Modify | `src/server/actions/library.test.ts` | Keep test environment fixture valid |
| Modify | `prisma/schema.prisma` | Add nullable `cityRef` and `branchRef` |
| Create | `prisma/migrations/<timestamp>_add_delivery_provider_refs/migration.sql` | Apply provider-reference columns |
| Modify | `src/lib/validators/delivery.ts` | Validate optional provider refs |
| Modify | `src/lib/validators/delivery.test.ts` | Test optional and invalid refs |
| Modify | `src/server/actions/create-order.ts` | Store provider refs |
| Create | `src/server/actions/create-order.test.ts` | Verify manual and selected-ref persistence |
| Create | `src/lib/nova-poshta-types.ts` | Shared normalized option types |
| Create | `src/server/integrations/nova-poshta.ts` | Server-only provider client and normalization |
| Create | `src/server/integrations/nova-poshta.test.ts` | Test provider contracts and failures |
| Create | `src/app/api/delivery/nova-poshta/cities/route.ts` | City-search proxy |
| Create | `src/app/api/delivery/nova-poshta/cities/route.test.ts` | Test city route validation and failures |
| Create | `src/app/api/delivery/nova-poshta/warehouses/route.ts` | Warehouse-search proxy |
| Create | `src/app/api/delivery/nova-poshta/warehouses/route.test.ts` | Test warehouse route validation and failures |
| Create | `src/components/forms/delivery-autocomplete.tsx` | Accessible debounced autocomplete with manual fallback |
| Create | `src/components/forms/delivery-autocomplete.test.tsx` | Test debounce, keyboard behavior, stale requests, fallback |
| Modify | `src/components/forms/checkout-form.tsx` | Integrate Nova Poshta autocomplete and refs |
| Modify | `src/components/forms/checkout-form.test.tsx` | Test checkout state transitions and submission |

---

### Task 1: Validate and Document the Nova Poshta API Key

**Files:**
- Modify: `.env.example`
- Modify: `src/lib/env.ts`
- Modify: `src/server/actions/assets.test.ts`
- Modify: `src/server/actions/library.test.ts`

- [ ] **Step 1: Add the variable to `.env.example`**

Append:

```dotenv
NOVA_POSHTA_API_KEY=
```

Do not add the real key and do not use a `NEXT_PUBLIC_` prefix.

- [ ] **Step 2: Add the variable to the environment schema**

Add this property to `envSchema` in `src/lib/env.ts`:

```ts
NOVA_POSHTA_API_KEY: z.string().min(1),
```

- [ ] **Step 3: Update test environment fixtures**

Add the following property to the `env` objects in both affected tests:

```ts
NOVA_POSHTA_API_KEY: 'nova-poshta-test-key',
```

- [ ] **Step 4: Run the environment-dependent focused tests**

Run:

```bash
npm run test -- src/server/actions/assets.test.ts src/server/actions/library.test.ts
```

Expected: both source test files pass. Duplicate tests from `.claude/worktrees` may also run because of the existing Vitest configuration.

- [ ] **Step 5: Commit**

```bash
git add .env.example src/lib/env.ts src/server/actions/assets.test.ts src/server/actions/library.test.ts
git commit -m "chore: configure Nova Poshta API key"
```

---

### Task 2: Add Delivery Provider References to Prisma

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/<timestamp>_add_delivery_provider_refs/migration.sql`

- [ ] **Step 1: Extend the `Delivery` model**

Add the fields after `city` and `branchNumber`:

```prisma
model Delivery {
  id             String          @id @default(cuid())
  orderId        String          @unique
  order          Order           @relation(fields: [orderId], references: [id], onDelete: Cascade)
  service        DeliveryService
  deliveryType   DeliveryType
  city           String
  cityRef        String?
  branchNumber   String?
  branchRef      String?
  street         String?
  house          String?
  apartment      String?
  recipientName  String
  recipientPhone String
  createdAt      DateTime        @default(now())
}
```

- [ ] **Step 2: Create and apply the migration**

Run:

```bash
npx prisma migrate dev --name add-delivery-provider-refs
```

Expected migration SQL:

```sql
ALTER TABLE "Delivery"
ADD COLUMN "cityRef" TEXT,
ADD COLUMN "branchRef" TEXT;
```

- [ ] **Step 3: Regenerate Prisma Client**

Run:

```bash
npx prisma generate
```

Expected: Prisma Client generation succeeds and `DeliveryCreateInput` includes both nullable fields.

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma prisma/migrations
git commit -m "feat: store Nova Poshta delivery references"
```

---

### Task 3: Validate and Persist Optional Provider References

**Files:**
- Modify: `src/lib/validators/delivery.ts`
- Modify: `src/lib/validators/delivery.test.ts`
- Modify: `src/server/actions/create-order.ts`
- Create: `src/server/actions/create-order.test.ts`

- [ ] **Step 1: Write failing validator tests**

Add:

```ts
it('accepts optional Nova Poshta city and branch refs', () => {
  const result = deliverySchema.safeParse({
    ...validBranch,
    cityRef: 'city-ref',
    branchRef: 'warehouse-ref',
  })

  expect(result.success).toBe(true)
})

it('rejects provider refs longer than 100 characters', () => {
  const result = deliverySchema.safeParse({
    ...validBranch,
    cityRef: 'x'.repeat(101),
    branchRef: 'y'.repeat(101),
  })

  expect(result.success).toBe(false)
  if (!result.success) {
    const paths = result.error.issues.map((issue) => issue.path.join('.'))
    expect(paths).toContain('cityRef')
    expect(paths).toContain('branchRef')
  }
})
```

- [ ] **Step 2: Run the validator test and verify failure**

Run:

```bash
npm run test -- src/lib/validators/delivery.test.ts
```

Expected: the overlong-ref test fails because unknown fields are currently stripped.

- [ ] **Step 3: Extend the schema**

Add:

```ts
cityRef: z.string().trim().max(100, 'Некоректний ідентифікатор міста').optional(),
branchRef: z.string().trim().max(100, 'Некоректний ідентифікатор відділення').optional(),
```

Keep refs optional for both branch and courier delivery.

- [ ] **Step 4: Write failing server-action tests**

Create `src/server/actions/create-order.test.ts` with module mocks for auth and Prisma:

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getCurrentSession: vi.fn(),
  userFindUnique: vi.fn(),
  taleFindUnique: vi.fn(),
  orderCreate: vi.fn(),
  deliveryCreate: vi.fn(),
}))

vi.mock('@/src/lib/auth', () => ({
  getCurrentSession: mocks.getCurrentSession,
}))

vi.mock('@/src/lib/db', () => ({
  db: {
    user: { findUnique: mocks.userFindUnique },
    tale: { findUnique: mocks.taleFindUnique },
    $transaction: async (
      callback: (tx: {
        order: { create: typeof mocks.orderCreate }
        delivery: { create: typeof mocks.deliveryCreate }
      }) => Promise<unknown>,
    ) =>
      callback({
        order: { create: mocks.orderCreate },
        delivery: { create: mocks.deliveryCreate },
      }),
  },
}))

import { createOrderAction } from './create-order'

const baseDelivery = {
  service: 'NOVA_POSHTA' as const,
  deliveryType: 'BRANCH' as const,
  city: 'Київ',
  branchNumber: 'Відділення №47',
  recipientName: 'Шевченко Тарас',
  recipientPhone: '+380671234567',
}

describe('createOrderAction provider refs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getCurrentSession.mockResolvedValue({ user: { email: 'user@example.com' } })
    mocks.userFindUnique.mockResolvedValue({ id: 'user-1' })
    mocks.taleFindUnique.mockResolvedValue({ accessType: 'PAID' })
    mocks.orderCreate.mockResolvedValue({ id: 'order-1' })
    mocks.deliveryCreate.mockResolvedValue({ id: 'delivery-1' })
  })

  it('stores selected provider refs', async () => {
    await createOrderAction('tale-1', {
      ...baseDelivery,
      cityRef: 'city-ref',
      branchRef: 'warehouse-ref',
    })

    expect(mocks.deliveryCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        cityRef: 'city-ref',
        branchRef: 'warehouse-ref',
      }),
    })
  })

  it('stores null refs for manual fallback', async () => {
    await createOrderAction('tale-1', baseDelivery)

    expect(mocks.deliveryCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        cityRef: null,
        branchRef: null,
      }),
    })
  })
})
```

- [ ] **Step 5: Run the action test and verify failure**

Run:

```bash
npm run test -- src/server/actions/create-order.test.ts
```

Expected: both assertions fail because the action does not write `cityRef` or `branchRef`.

- [ ] **Step 6: Store refs in `createOrderAction`**

Add:

```ts
cityRef: parsed.data.cityRef || null,
branchRef:
  parsed.data.deliveryType === 'BRANCH'
    ? parsed.data.branchRef || null
    : null,
```

Place `cityRef` after `city` and `branchRef` after `branchNumber`.

- [ ] **Step 7: Run focused tests**

Run:

```bash
npm run test -- src/lib/validators/delivery.test.ts src/server/actions/create-order.test.ts
```

Expected: all source tests pass.

- [ ] **Step 8: Commit**

```bash
git add src/lib/validators/delivery.ts src/lib/validators/delivery.test.ts src/server/actions/create-order.ts src/server/actions/create-order.test.ts
git commit -m "feat: validate and persist delivery provider refs"
```

---

### Task 4: Build the Server-Only Nova Poshta Client

**Files:**
- Create: `src/lib/nova-poshta-types.ts`
- Create: `src/server/integrations/nova-poshta.ts`
- Create: `src/server/integrations/nova-poshta.test.ts`

- [ ] **Step 1: Define normalized application types**

Create `src/lib/nova-poshta-types.ts`:

```ts
export type NovaPoshtaCityOption = {
  ref: string
  value: string
  name: string
  area: string | null
  region: string | null
  label: string
}

export type NovaPoshtaWarehouseOption = {
  ref: string
  value: string
  number: string
  description: string
  type: 'BRANCH' | 'PARCEL_LOCKER'
  label: string
}

export type DeliveryAutocompleteOption = {
  ref: string
  value: string
  label: string
}
```

- [ ] **Step 2: Write failing provider-client tests**

Test these concrete contracts:

```ts
it('normalizes settlement search results', async () => {
  mockFetch.mockResolvedValue(
    jsonResponse({
      success: true,
      data: [
        {
          Addresses: [
            {
              DeliveryCity: 'city-ref',
              MainDescription: 'Бровари',
              Area: 'Київська',
              Region: 'Броварський',
            },
          ],
        },
      ],
      errors: [],
      warnings: [],
    }),
  )

  await expect(searchNovaPoshtaCities('Бро')).resolves.toEqual([
    {
      ref: 'city-ref',
      value: 'Бровари',
      name: 'Бровари',
      area: 'Київська',
      region: 'Броварський',
      label: 'Бровари, Київська обл., Броварський р-н',
    },
  ])
})

it('returns branches and parcel lockers together', async () => {
  mockFetch.mockResolvedValue(
    jsonResponse({
      success: true,
      data: [
        {
          Ref: 'branch-ref',
          Number: '47',
          Description: 'Відділення №47: вул. Хрещатик, 1',
          CategoryOfWarehouse: 'Branch',
        },
        {
          Ref: 'locker-ref',
          Number: '30001',
          Description: 'Поштомат №30001: вул. Хрещатик, 2',
          CategoryOfWarehouse: 'Postomat',
        },
      ],
      errors: [],
      warnings: [],
    }),
  )

  const result = await searchNovaPoshtaWarehouses('city-ref', '')

  expect(result.map((option) => option.type)).toEqual(['BRANCH', 'PARCEL_LOCKER'])
  expect(result[0].label).toContain('Відділення')
  expect(result[1].label).toContain('Поштомат')
})

it('maps unsuccessful provider responses to NovaPoshtaUnavailableError', async () => {
  mockFetch.mockResolvedValue(
    jsonResponse({ success: false, data: [], errors: ['provider detail'], warnings: [] }),
  )

  await expect(searchNovaPoshtaCities('Ки')).rejects.toBeInstanceOf(
    NovaPoshtaUnavailableError,
  )
})

it('maps network errors to NovaPoshtaUnavailableError', async () => {
  mockFetch.mockRejectedValue(new TypeError('network failed'))

  await expect(searchNovaPoshtaCities('Ки')).rejects.toBeInstanceOf(
    NovaPoshtaUnavailableError,
  )
})
```

The test helper must mock `getEnv()` and `global.fetch`; it must never contain the real key.

- [ ] **Step 3: Run the provider tests and verify failure**

Run:

```bash
npm run test -- src/server/integrations/nova-poshta.test.ts
```

Expected: import failure because the client does not exist.

- [ ] **Step 4: Implement the provider client**

Create `src/server/integrations/nova-poshta.ts` with:

```ts
import 'server-only'

import { getEnv } from '@/src/lib/env'
import type {
  NovaPoshtaCityOption,
  NovaPoshtaWarehouseOption,
} from '@/src/lib/nova-poshta-types'

const NOVA_POSHTA_URL = 'https://api.novaposhta.ua/v2.0/json/'
const RESULT_LIMIT = '20'
const REQUEST_TIMEOUT_MS = 5_000

type NovaPoshtaEnvelope<T> = {
  success: boolean
  data: T[]
  errors?: string[]
  warnings?: string[]
}

type SettlementAddress = {
  DeliveryCity?: string
  MainDescription?: string
  Area?: string
  Region?: string
}

type SettlementSearchData = {
  Addresses?: SettlementAddress[]
}

type WarehouseData = {
  Ref?: string
  Number?: string
  Description?: string
  CategoryOfWarehouse?: string
}

export class NovaPoshtaUnavailableError extends Error {
  constructor() {
    super('Nova Poshta is unavailable')
    this.name = 'NovaPoshtaUnavailableError'
  }
}

async function callNovaPoshta<T>(
  modelName: string,
  calledMethod: string,
  methodProperties: Record<string, string>,
): Promise<T[]> {
  try {
    const response = await fetch(NOVA_POSHTA_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        apiKey: getEnv().NOVA_POSHTA_API_KEY,
        modelName,
        calledMethod,
        methodProperties,
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new NovaPoshtaUnavailableError()
    }

    const payload = (await response.json()) as NovaPoshtaEnvelope<T>
    if (!payload.success || !Array.isArray(payload.data)) {
      throw new NovaPoshtaUnavailableError()
    }

    return payload.data
  } catch (error) {
    if (error instanceof NovaPoshtaUnavailableError) {
      throw error
    }
    throw new NovaPoshtaUnavailableError()
  }
}

function cityLabel(city: SettlementAddress) {
  return [
    city.MainDescription,
    city.Area ? `${city.Area} обл.` : null,
    city.Region ? `${city.Region} р-н` : null,
  ]
    .filter(Boolean)
    .join(', ')
}

export async function searchNovaPoshtaCities(
  query: string,
): Promise<NovaPoshtaCityOption[]> {
  const data = await callNovaPoshta<SettlementSearchData>('Address', 'searchSettlements', {
    CityName: query,
    Limit: RESULT_LIMIT,
    Page: '1',
  })

  return (data[0]?.Addresses ?? [])
    .filter(
      (item): item is Required<Pick<SettlementAddress, 'DeliveryCity' | 'MainDescription'>> &
        SettlementAddress => Boolean(item.DeliveryCity && item.MainDescription),
    )
    .slice(0, 20)
    .map((item) => ({
      ref: item.DeliveryCity,
      value: item.MainDescription,
      name: item.MainDescription,
      area: item.Area || null,
      region: item.Region || null,
      label: cityLabel(item),
    }))
}

export async function searchNovaPoshtaWarehouses(
  cityRef: string,
  query: string,
): Promise<NovaPoshtaWarehouseOption[]> {
  const data = await callNovaPoshta<WarehouseData>('AddressGeneral', 'getWarehouses', {
    SettlementRef: cityRef,
    FindByString: query,
    Limit: RESULT_LIMIT,
    Page: '1',
    Language: 'UA',
  })

  return data
    .filter(
      (item): item is Required<Pick<WarehouseData, 'Ref' | 'Number' | 'Description'>> &
        WarehouseData => Boolean(item.Ref && item.Number && item.Description),
    )
    .slice(0, 20)
    .map((item) => {
      const isParcelLocker =
        item.CategoryOfWarehouse?.toLowerCase().includes('postomat') ||
        item.Description.toLowerCase().includes('поштомат')
      const type = isParcelLocker ? 'PARCEL_LOCKER' : 'BRANCH'
      const typeLabel = isParcelLocker ? 'Поштомат' : 'Відділення'
      const label = `[${typeLabel}] ${item.Description}`

      return {
        ref: item.Ref,
        value: label,
        number: item.Number,
        description: item.Description,
        type,
        label,
      }
    })
}
```

- [ ] **Step 5: Run provider tests**

Run:

```bash
npm run test -- src/server/integrations/nova-poshta.test.ts
```

Expected: all provider tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/lib/nova-poshta-types.ts src/server/integrations/nova-poshta.ts src/server/integrations/nova-poshta.test.ts
git commit -m "feat: add Nova Poshta server client"
```

---

### Task 5: Add City and Warehouse Proxy Routes

**Files:**
- Create: `src/app/api/delivery/nova-poshta/cities/route.ts`
- Create: `src/app/api/delivery/nova-poshta/cities/route.test.ts`
- Create: `src/app/api/delivery/nova-poshta/warehouses/route.ts`
- Create: `src/app/api/delivery/nova-poshta/warehouses/route.test.ts`

- [ ] **Step 1: Write failing city-route tests**

Cover:

```ts
it('returns an empty list without calling Nova Poshta for fewer than 2 characters')
it('returns 400 for a query longer than 100 characters')
it('returns normalized options')
it('returns a generic 502 response when Nova Poshta fails')
```

The successful assertion must be:

```ts
expect(await response.json()).toEqual({
  options: [
    expect.objectContaining({
      ref: 'city-ref',
      value: 'Київ',
      label: expect.stringContaining('Київ'),
    }),
  ],
})
```

- [ ] **Step 2: Write failing warehouse-route tests**

Cover:

```ts
it('returns 400 when cityRef is absent')
it('returns 400 when cityRef or q exceeds 100 characters')
it('passes cityRef and q to the provider client')
it('returns branch and parcel-locker options')
it('returns a generic 502 response when Nova Poshta fails')
```

- [ ] **Step 3: Run route tests and verify failure**

Run:

```bash
npm run test -- src/app/api/delivery/nova-poshta/cities/route.test.ts src/app/api/delivery/nova-poshta/warehouses/route.test.ts
```

Expected: import failures because both routes are missing.

- [ ] **Step 4: Implement the city route**

Create:

```ts
import { NextResponse } from 'next/server'
import {
  NovaPoshtaUnavailableError,
  searchNovaPoshtaCities,
} from '@/src/server/integrations/nova-poshta'

const UNAVAILABLE_MESSAGE =
  'Сервіс Нової Пошти тимчасово недоступний. Введіть місто вручну.'

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get('q')?.trim() ?? ''

  if (query.length > 100) {
    return NextResponse.json({ error: 'Некоректний пошуковий запит' }, { status: 400 })
  }

  if (query.length < 2) {
    return NextResponse.json({ options: [] })
  }

  try {
    return NextResponse.json({ options: await searchNovaPoshtaCities(query) })
  } catch (error) {
    if (error instanceof NovaPoshtaUnavailableError) {
      return NextResponse.json({ error: UNAVAILABLE_MESSAGE }, { status: 502 })
    }
    return NextResponse.json({ error: UNAVAILABLE_MESSAGE }, { status: 502 })
  }
}
```

- [ ] **Step 5: Implement the warehouse route**

Create:

```ts
import { NextResponse } from 'next/server'
import {
  NovaPoshtaUnavailableError,
  searchNovaPoshtaWarehouses,
} from '@/src/server/integrations/nova-poshta'

const UNAVAILABLE_MESSAGE =
  'Сервіс Нової Пошти тимчасово недоступний. Введіть відділення вручну.'

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const cityRef = params.get('cityRef')?.trim() ?? ''
  const query = params.get('q')?.trim() ?? ''

  if (!cityRef || cityRef.length > 100 || query.length > 100) {
    return NextResponse.json({ error: 'Некоректні параметри пошуку' }, { status: 400 })
  }

  try {
    return NextResponse.json({
      options: await searchNovaPoshtaWarehouses(cityRef, query),
    })
  } catch (error) {
    if (error instanceof NovaPoshtaUnavailableError) {
      return NextResponse.json({ error: UNAVAILABLE_MESSAGE }, { status: 502 })
    }
    return NextResponse.json({ error: UNAVAILABLE_MESSAGE }, { status: 502 })
  }
}
```

- [ ] **Step 6: Run route tests**

Run:

```bash
npm run test -- src/app/api/delivery/nova-poshta/cities/route.test.ts src/app/api/delivery/nova-poshta/warehouses/route.test.ts
```

Expected: all source route tests pass and provider details are absent from error responses.

- [ ] **Step 7: Commit**

```bash
git add src/app/api/delivery/nova-poshta
git commit -m "feat: proxy Nova Poshta delivery searches"
```

---

### Task 6: Build the Accessible Autocomplete Control

**Files:**
- Create: `src/components/forms/delivery-autocomplete.tsx`
- Create: `src/components/forms/delivery-autocomplete.test.tsx`

- [ ] **Step 1: Write failing component tests**

Test these behaviors with fake timers and a mocked `fetch`:

```ts
it('waits 300ms before requesting options')
it('does not request before minQueryLength is reached')
it('renders returned options and selects one with Enter')
it('supports ArrowDown, ArrowUp, and Escape')
it('ignores an older response after the query changes')
it('shows a non-blocking manual-entry message on API failure')
it('continues to accept text after API failure')
```

Use a city example:

```ts
render(
  <DeliveryAutocomplete
    id="city"
    label="Місто *"
    value=""
    placeholder="Місто"
    minQueryLength={2}
    buildRequestUrl={(query) =>
      `/api/delivery/nova-poshta/cities?q=${encodeURIComponent(query)}`
    }
    onValueChange={onValueChange}
    onSelect={onSelect}
  />,
)
```

- [ ] **Step 2: Run the autocomplete test and verify failure**

Run:

```bash
npm run test -- src/components/forms/delivery-autocomplete.test.tsx
```

Expected: import failure because the component is missing.

- [ ] **Step 3: Implement `DeliveryAutocomplete`**

The public API must be:

```ts
type DeliveryAutocompleteProps = {
  id: string
  label: string
  value: string
  placeholder: string
  minQueryLength: number
  disabled?: boolean
  buildRequestUrl: (query: string) => string | null
  onValueChange: (value: string) => void
  onSelect: (option: DeliveryAutocompleteOption) => void
}
```

Implementation requirements:

```tsx
<input
  id={id}
  role="combobox"
  aria-autocomplete="list"
  aria-expanded={open}
  aria-controls={`${id}-listbox`}
  aria-activedescendant={
    activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined
  }
/>
```

Use:

```ts
const DEBOUNCE_MS = 300
```

Each search effect must:

1. wait 300 ms;
2. create an `AbortController`;
3. call the supplied URL;
4. require `{ options: DeliveryAutocompleteOption[] }`;
5. ignore `AbortError`;
6. preserve the input value on failure;
7. show the response error or the generic fallback message;
8. abort and clear the timer on cleanup.

Keyboard behavior:

```ts
if (event.key === 'ArrowDown') // move active option down
if (event.key === 'ArrowUp') // move active option up
if (event.key === 'Enter' && activeIndex >= 0) // select active option
if (event.key === 'Escape') // close options without clearing text
```

Render the result list with:

```tsx
<ul id={`${id}-listbox`} role="listbox">
  {options.map((option, index) => (
    <li
      id={`${id}-option-${index}`}
      role="option"
      aria-selected={index === activeIndex}
      key={option.ref}
    >
      <button type="button">{option.label}</button>
    </li>
  ))}
</ul>
```

Expose loading and failure text in:

```tsx
<p aria-live="polite">
  {loading ? 'Завантаження…' : error}
</p>
```

- [ ] **Step 4: Run component tests**

Run:

```bash
npm run test -- src/components/forms/delivery-autocomplete.test.tsx
```

Expected: all source autocomplete tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/forms/delivery-autocomplete.tsx src/components/forms/delivery-autocomplete.test.tsx
git commit -m "feat: add delivery autocomplete control"
```

---

### Task 7: Integrate Autocomplete into Checkout

**Files:**
- Modify: `src/components/forms/checkout-form.tsx`
- Modify: `src/components/forms/checkout-form.test.tsx`

- [ ] **Step 1: Replace obsolete carrier tests**

Remove tests that expect two carrier radio buttons or Ukrposhta-specific courier behavior.

Add:

```ts
it('shows Nova Poshta as the only carrier', () => {
  render(<CheckoutForm tale={tale} />)

  expect(screen.getByText('Нова Пошта')).toBeInTheDocument()
  expect(screen.queryByText('Укрпошта')).not.toBeInTheDocument()
  expect(screen.queryByRole('radio', { name: 'Нова Пошта' })).not.toBeInTheDocument()
})
```

- [ ] **Step 2: Add failing autocomplete state-transition tests**

Add tests for:

```ts
it('selects a city and then loads branches and parcel lockers')
it('clears cityRef, branch text, and branchRef when city text is edited')
it('clears branchRef when selected warehouse text is edited')
it('clears warehouse state when switching to courier')
it('submits selected cityRef and branchRef')
it('submits manual city and branch values without refs after API failure')
```

For selected refs, mock city and warehouse route responses, choose the options, fill recipient fields, submit, and assert:

```ts
expect(vi.mocked(createOrderAction)).toHaveBeenCalledWith('tale-1', {
  service: 'NOVA_POSHTA',
  deliveryType: 'BRANCH',
  city: 'Київ',
  cityRef: 'city-ref',
  branchNumber: '[Поштомат] Поштомат №30001: вул. Хрещатик, 2',
  branchRef: 'locker-ref',
  street: undefined,
  house: undefined,
  apartment: undefined,
  recipientName: 'Шевченко Тарас',
  recipientPhone: '+380671234567',
})
```

- [ ] **Step 3: Run checkout tests and verify failure**

Run:

```bash
npm run test -- src/components/forms/checkout-form.test.tsx
```

Expected: new tests fail because checkout still uses plain inputs and exposes Ukrposhta.

- [ ] **Step 4: Simplify carrier state**

Remove:

```ts
const [service, setService] = ...
function handleServiceChange(...) { ... }
```

Render a static carrier section:

```tsx
<div>
  <p className="text-sm font-medium text-app-text">Служба доставки</p>
  <p className="mt-2 text-app-text">Нова Пошта</p>
</div>
```

Always submit:

```ts
service: 'NOVA_POSHTA',
```

- [ ] **Step 5: Add provider-reference state**

Add:

```ts
const [cityRef, setCityRef] = React.useState<string | undefined>()
const [branchRef, setBranchRef] = React.useState<string | undefined>()
```

Add city handlers:

```ts
function handleCityTextChange(value: string) {
  setCity(value)
  setCityRef(undefined)
  setBranchNumber('')
  setBranchRef(undefined)
}

function handleCitySelect(option: DeliveryAutocompleteOption) {
  setCity(option.value)
  setCityRef(option.ref)
  setBranchNumber('')
  setBranchRef(undefined)
}
```

Add warehouse handlers:

```ts
function handleBranchTextChange(value: string) {
  setBranchNumber(value)
  setBranchRef(undefined)
}

function handleBranchSelect(option: DeliveryAutocompleteOption) {
  setBranchNumber(option.value)
  setBranchRef(option.ref)
}
```

Add delivery-type transition:

```ts
function handleDeliveryTypeChange(value: 'BRANCH' | 'COURIER') {
  setDeliveryType(value)
  setBranchNumber('')
  setBranchRef(undefined)
}
```

- [ ] **Step 6: Replace city and branch inputs**

City:

```tsx
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
```

Branch mode:

```tsx
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
```

- [ ] **Step 7: Submit refs**

Extend the delivery payload:

```ts
cityRef,
branchRef: deliveryType === 'BRANCH' ? branchRef : undefined,
```

Keep text fields authoritative and refs optional.

- [ ] **Step 8: Run checkout tests**

Run:

```bash
npm run test -- src/components/forms/checkout-form.test.tsx
```

Expected: all source checkout tests pass, including manual fallback.

- [ ] **Step 9: Commit**

```bash
git add src/components/forms/checkout-form.tsx src/components/forms/checkout-form.test.tsx
git commit -m "feat: add Nova Poshta autocomplete to checkout"
```

---

### Task 8: Verify the Complete Sprint 2 Slice

**Files:**
- No intentional source changes unless verification reveals a defect

- [ ] **Step 1: Run the focused Sprint 2 suite**

```bash
npm run test -- \
  src/lib/validators/delivery.test.ts \
  src/server/actions/create-order.test.ts \
  src/server/integrations/nova-poshta.test.ts \
  src/app/api/delivery/nova-poshta/cities/route.test.ts \
  src/app/api/delivery/nova-poshta/warehouses/route.test.ts \
  src/components/forms/delivery-autocomplete.test.tsx \
  src/components/forms/checkout-form.test.tsx
```

Expected: all source tests pass.

- [ ] **Step 2: Run type checking**

```bash
npm run typecheck
```

Expected: no TypeScript errors.

- [ ] **Step 3: Run lint**

```bash
npm run lint
```

Expected: no ESLint errors.

- [ ] **Step 4: Run production build**

```bash
npm run build
```

Expected: Prisma generation and Next.js production build succeed.

- [ ] **Step 5: Start the application**

```bash
npm run dev
```

Expected: application is available at `http://127.0.0.1:3002`.

- [ ] **Step 6: Verify checkout in the in-app browser**

Open a paid tale and navigate to:

```text
http://127.0.0.1:3002/checkout?slug={paid-tale-slug}
```

Verify at desktop and mobile widths:

1. only Nova Poshta is visible;
2. typing two city characters shows suggestions;
3. selecting a city enables branch and parcel-locker suggestions;
4. both warehouse types are visibly labeled;
5. keyboard selection works;
6. editing selected text clears the provider selection but keeps manual input possible;
7. courier mode hides warehouse lookup;
8. no controls overlap or overflow.

- [ ] **Step 7: Verify graceful provider failure**

Temporarily use an invalid local key or mock the proxy response in development, then verify:

1. a non-blocking Ukrainian message appears;
2. city and branch remain editable;
3. manual data can still pass client validation;
4. restore the real key immediately after the check.

- [ ] **Step 8: Inspect the final diff**

```bash
git status --short
git diff --check
git log --oneline -10
```

Expected: only intended Sprint 2 changes plus the pre-existing generated-file changes (`next-env.d.ts`, `tsconfig.tsbuildinfo`) and `.codex/` remain.
