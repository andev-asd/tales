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
    const result = deliverySchema.safeParse({
      service: validBranch.service,
      deliveryType: validBranch.deliveryType,
      city: validBranch.city,
      recipientName: validBranch.recipientName,
      recipientPhone: validBranch.recipientPhone,
    })
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
