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

  it("hides Кур'єр option when Укрпошта is selected", async () => {
    const user = userEvent.setup()
    render(<CheckoutForm tale={tale} />)

    await user.click(screen.getByRole('radio', { name: 'Укрпошта' }))

    expect(screen.queryByRole('radio', { name: "Кур'єр" })).not.toBeInTheDocument()
  })

  it('shows branch number field by default (BRANCH type)', () => {
    render(<CheckoutForm tale={tale} />)
    expect(screen.getByPlaceholderText(/номер відділення/i)).toBeInTheDocument()
  })

  it("shows address fields when Кур'єр is selected", async () => {
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
