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
