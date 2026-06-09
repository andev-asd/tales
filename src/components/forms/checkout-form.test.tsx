import React from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CheckoutForm } from './checkout-form'
import { createOrderAction } from '@/src/server/actions/create-order'

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
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

  it('calls createOrderAction with tale id and delivery data on valid submit', async () => {
    const user = userEvent.setup()
    render(<CheckoutForm tale={tale} />)

    await user.type(screen.getByLabelText('Місто *'), 'Київ')
    await user.type(screen.getByLabelText('Відділення *'), '47')
    await user.type(screen.getByLabelText('ПІБ отримувача *'), 'Шевченко Тарас')
    await user.clear(screen.getByLabelText('Телефон *'))
    await user.type(screen.getByLabelText('Телефон *'), '+380671234567')

    await user.click(screen.getByRole('button', { name: 'Підтвердити замовлення' }))

    await vi.waitFor(() => {
      expect(vi.mocked(createOrderAction)).toHaveBeenCalledWith('tale-1', expect.objectContaining({ city: 'Київ' }))
      expect(mockPush).toHaveBeenCalledWith('/orders/order-1')
    })
  })

  it('shows error message when createOrderAction returns error', async () => {
    vi.mocked(createOrderAction).mockResolvedValueOnce({ ok: false, error: 'Помилка сервера' })

    const user = userEvent.setup()
    render(<CheckoutForm tale={tale} />)

    await user.type(screen.getByLabelText('Місто *'), 'Київ')
    await user.type(screen.getByLabelText('Відділення *'), '47')
    await user.type(screen.getByLabelText('ПІБ отримувача *'), 'Шевченко Тарас')
    await user.clear(screen.getByLabelText('Телефон *'))
    await user.type(screen.getByLabelText('Телефон *'), '+380671234567')

    await user.click(screen.getByRole('button', { name: 'Підтвердити замовлення' }))

    await vi.waitFor(() => {
      expect(screen.getByText('Помилка сервера')).toBeInTheDocument()
    })
  })
})
