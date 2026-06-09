# Checkout + Delivery Form — Sprint 1

## Goal

Add a checkout page where clients select a delivery method for their printed book. All paid tale orders go through this flow. Payment is out of scope (Sprint 3).

## Context

Paid tales (`PAID`, `PERSONALIZABLE`) will be printed and shipped. Currently "Оформити замовлення" (TaleActions) and "Замовити друк" (Toolbar) are dead ends — no checkout exists. This sprint wires them both to `/checkout?slug=` and creates the Order + Delivery in the database.

## Flow

```
"Оформити замовлення" (TaleActions)   ─┐
"Замовити друк" (Editor Toolbar)       ┘
         ↓
/checkout?slug={taleSlug}
  Server Component — loads tale by slug (title, cover, price, accessType)
  Renders CheckoutForm (Client Component)
         ↓
createOrderAction(taleId, deliveryData)
  — creates Order (type: READY_TALE or PERSONALIZED_TEMPLATE per tale.accessType)
  — creates Delivery linked to Order
         ↓
redirect → /orders/{orderId}
  Shows "Замовлення прийнято" success banner
```

Order is created with status `NEW`. Payment is handled in Sprint 3.

## Data Model

### New enums

```prisma
enum DeliveryService {
  NOVA_POSHTA
  UKRPOSHTA
  COURIER
}

enum DeliveryType {
  BRANCH    // відділення або поштомат
  COURIER   // адресна доставка (тільки Нова Пошта)
}
```

### New model

```prisma
model Delivery {
  id             String          @id @default(cuid())
  orderId        String          @unique
  order          Order           @relation(fields: [orderId], references: [id], onDelete: Cascade)

  service        DeliveryService
  deliveryType   DeliveryType

  city           String

  // BRANCH only
  branchNumber   String?

  // COURIER only
  street         String?
  house          String?
  apartment      String?

  // Recipient
  recipientName  String
  recipientPhone String          // format: +380XXXXXXXXX

  createdAt      DateTime        @default(now())
}
```

### Changes to existing models

`Order` gets:
```prisma
delivery  Delivery?
```

### Future extensions (out of scope now)
- Sprint 2 adds `cityRef String?` and `branchRef String?` (API identifiers from NP/Ukrposhta) — no breaking changes
- Sprint 3 adds `trackingNumber String?` and `waybillUrl String?` after shipment

## UI

Page `/checkout?slug=` — two-column desktop / stacked mobile layout.

**Left column — Tale card:**
- Cover image, title, price (or "ціна уточнюється" if null)
- Short description

**Right column — Delivery form:**

```
Служба доставки
  ○ Нова Пошта
  ○ Укрпошта

Тип доставки
  ○ Відділення / поштомат
  ○ Кур'єр                ← only for Нова Пошта

Місто *
  [ text input ]          ← Sprint 2: autocomplete from NP/Ukrposhta API

Відділення *              ← shown when deliveryType = BRANCH
  [ text input ]          ← номер відділення

── OR ──

Вулиця *                  ← shown when deliveryType = COURIER
  [ text input ]
Будинок *    Квартира
  [ text ]   [ text ]

ПІБ отримувача *
  [ text input ]

Телефон *
  [ +380____________ ]

[ Підтвердити замовлення ]
```

**Rules:**
- COURIER delivery type is only available when service = NOVA_POSHTA
- Switching service resets deliveryType to BRANCH
- Phone validated as Ukrainian mobile: `/^\+380\d{9}$/`
- All fields with * are required; apartment is optional

## Files

### New files

| File | Purpose |
|------|---------|
| `src/app/checkout/page.tsx` | Server Component — loads tale by slug, renders CheckoutForm |
| `src/components/forms/checkout-form.tsx` | Client Component — full form with state and validation |
| `src/lib/validators/delivery.ts` | Zod schema for DeliveryInput |
| `src/server/actions/create-order.ts` | Server Action: `createOrderAction` |
| `src/server/queries/checkout.ts` | `getCheckoutTaleBySlug()` — tale data for checkout page |

### Modified files

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Add `Delivery` model + `DeliveryService` + `DeliveryType` enums; add `delivery Delivery?` to `Order` |
| `src/components/tales/tale-actions.tsx` | "Оформити замовлення" → `<Link href="/checkout?slug={tale.slug}">` |
| `src/features/editor/Toolbar.tsx` | "Замовити друк" already links to `/custom-story` → change to `/checkout` (slug passed via prop) |
| `src/app/editor/page.tsx` | Pass `slug` from searchParams to Editor/Toolbar so "Замовити друк" can include it |

## Server Action: `createOrderAction`

```ts
// Input type (from Zod schema)
type DeliveryInput = {
  service: 'NOVA_POSHTA' | 'UKRPOSHTA' | 'COURIER'
  deliveryType: 'BRANCH' | 'COURIER'
  city: string
  branchNumber?: string   // required when deliveryType = BRANCH
  street?: string         // required when deliveryType = COURIER
  house?: string          // required when deliveryType = COURIER
  apartment?: string
  recipientName: string
  recipientPhone: string  // +380XXXXXXXXX
}
```

Steps:
1. Verify session — redirect to `/login` if not authenticated
2. Validate `delivery` with Zod schema (server-side)
3. Load tale by `taleId` to determine `OrderType` (PAID → `READY_TALE`, PERSONALIZABLE → `PERSONALIZED_TEMPLATE`)
4. Prisma transaction: `order.create` + `delivery.create`
5. Return `{ orderId }` — client calls `router.push('/orders/' + orderId)`

## Toolbar slug propagation

`Toolbar.tsx` currently has a hardcoded `href="/custom-story"` for "Замовити друк". It needs to receive the tale slug:

```
EditorPage (Server Component)
  reads slug from searchParams
  passes to Editor as prop → EditorShell → Toolbar
  
Toolbar renders:
  href={slug ? `/checkout?slug=${slug}` : '/catalog'}
```

If no slug (blank editor), "Замовити друк" links to `/catalog`.

## Error Handling

- `/checkout?slug=unknown` → redirect to `/catalog` with error toast
- Unauthenticated → redirect to `/login?redirect=/checkout?slug=`
- Form submit error → inline error message, button re-enabled
- Tale not found on action → return `{ error: 'Tale not found' }`

## PERSONALIZABLE Tales

`TaleActions` has two buttons for PERSONALIZABLE tales: "Купити шаблон" and "Персоналізувати ім'ям". In Sprint 1:

- **"Купити шаблон"** → `/checkout?slug=` (creates `PERSONALIZED_TEMPLATE` order, same checkout flow)
- **"Персоналізувати ім'ям"** → unchanged (separate feature, out of scope)

## Out of Scope (Sprint 1)

- Real postal API (city/branch autocomplete) → Sprint 2
- Payment → Sprint 3
- Order confirmation email
- Saved delivery addresses (reuse from previous order)
- Courier delivery for Ukrposhta
- Personalization flow ("Персоналізувати ім'ям")
