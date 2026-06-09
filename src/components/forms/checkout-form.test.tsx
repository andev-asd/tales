import React from 'react';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createOrderAction } from '@/src/server/actions/create-order';

import { CheckoutForm } from './checkout-form';

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  fetch: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push }),
}));

vi.mock('@/src/server/actions/create-order', () => ({
  createOrderAction: vi.fn(),
}));

vi.stubGlobal('fetch', mocks.fetch);

const tale = {
  id: 'tale-1',
  title: 'Казка про зайченя',
  shortDescription: 'Чудова казка',
  coverUrl: null,
  price: 350,
};

const cityOptions = [
  {
    ref: 'city-ref',
    value: 'Київ',
    name: 'Київ',
    area: 'Київська',
    region: null,
    label: 'Київ, Київська обл.',
  },
];

const warehouseOptions = [
  {
    ref: 'branch-ref',
    value: '[Відділення] Відділення №47: вул. Хрещатик, 1',
    number: '47',
    description: 'Відділення №47: вул. Хрещатик, 1',
    type: 'BRANCH',
    label: '[Відділення] Відділення №47: вул. Хрещатик, 1',
  },
  {
    ref: 'locker-ref',
    value: '[Поштомат] Поштомат №30001: вул. Хрещатик, 2',
    number: '30001',
    description: 'Поштомат №30001: вул. Хрещатик, 2',
    type: 'PARCEL_LOCKER',
    label: '[Поштомат] Поштомат №30001: вул. Хрещатик, 2',
  },
];

function jsonResponse(payload: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { 'content-type': 'application/json' },
    ...init,
  });
}

function mockSuccessfulDeliverySearches() {
  mocks.fetch.mockImplementation((input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes('/cities?')) {
      return Promise.resolve(jsonResponse({ options: cityOptions }));
    }
    if (url.includes('/warehouses?')) {
      return Promise.resolve(jsonResponse({ options: warehouseOptions }));
    }
    throw new Error(`Unexpected request: ${url}`);
  });
}

async function selectCity(
  user: ReturnType<typeof userEvent.setup>,
): Promise<void> {
  await user.type(screen.getByRole('combobox', { name: 'Місто *' }), 'Ки');
  await user.click(
    await screen.findByRole(
      'button',
      { name: 'Київ, Київська обл.' },
      { timeout: 2_000 },
    ),
  );
}

async function selectWarehouse(
  user: ReturnType<typeof userEvent.setup>,
  name = '[Поштомат] Поштомат №30001: вул. Хрещатик, 2',
): Promise<void> {
  await user.click(
    await screen.findByRole('button', { name }, { timeout: 2_000 }),
  );
}

async function fillRecipient(
  user: ReturnType<typeof userEvent.setup>,
): Promise<void> {
  await user.type(
    screen.getByLabelText('ПІБ отримувача *'),
    'Шевченко Тарас',
  );
  await user.clear(screen.getByLabelText('Телефон *'));
  await user.type(screen.getByLabelText('Телефон *'), '+380671234567');
}

async function submitOrder(user: ReturnType<typeof userEvent.setup>) {
  await user.click(
    screen.getByRole('button', { name: 'Підтвердити замовлення' }),
  );
}

describe('CheckoutForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createOrderAction).mockResolvedValue({
      ok: true,
      orderId: 'order-1',
    });
    mocks.fetch.mockResolvedValue(jsonResponse({ options: [] }));
  });

  afterEach(() => {
    cleanup();
  });

  it('shows Nova Poshta as the only carrier', () => {
    render(<CheckoutForm tale={tale} />);

    expect(screen.getByText('Нова Пошта')).toBeInTheDocument();
    expect(screen.queryByText('Укрпошта')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('radio', { name: 'Нова Пошта' }),
    ).not.toBeInTheDocument();
  });

  it('renders delivery type radio buttons', () => {
    render(<CheckoutForm tale={tale} />);

    expect(
      screen.getByRole('radio', { name: 'Відділення / поштомат' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('radio', { name: "Кур'єр" }),
    ).toBeInTheDocument();
  });

  it("shows address fields when Кур'єр is selected", async () => {
    const user = userEvent.setup();
    render(<CheckoutForm tale={tale} />);

    await user.click(screen.getByRole('radio', { name: "Кур'єр" }));

    expect(screen.getByPlaceholderText(/хрещатик/i)).toBeInTheDocument();
    expect(
      screen.queryByRole('combobox', { name: 'Відділення / поштомат *' }),
    ).not.toBeInTheDocument();
  });

  it('shows tale title and price', () => {
    render(<CheckoutForm tale={tale} />);

    expect(screen.getByText('Казка про зайченя')).toBeInTheDocument();
    expect(screen.getByText('350 грн')).toBeInTheDocument();
  });

  it('shows "Ціна уточнюється" when price is null', () => {
    render(<CheckoutForm tale={{ ...tale, price: null }} />);

    expect(screen.getByText('Ціна уточнюється')).toBeInTheDocument();
  });

  it('selects a city and then loads branches and parcel lockers', async () => {
    mockSuccessfulDeliverySearches();
    const user = userEvent.setup();
    render(<CheckoutForm tale={tale} />);

    await selectCity(user);

    expect(
      await screen.findByRole(
        'button',
        { name: '[Відділення] Відділення №47: вул. Хрещатик, 1' },
        { timeout: 2_000 },
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: '[Поштомат] Поштомат №30001: вул. Хрещатик, 2',
      }),
    ).toBeInTheDocument();
  });

  it('clears cityRef, branch text, and branchRef when city text is edited', async () => {
    mockSuccessfulDeliverySearches();
    const user = userEvent.setup();
    render(<CheckoutForm tale={tale} />);

    await selectCity(user);
    await selectWarehouse(user);
    const cityInput = screen.getByRole('combobox', { name: 'Місто *' });
    await user.clear(cityInput);
    await user.type(cityInput, 'Львів');

    const branchInput = screen.getByRole('combobox', {
      name: 'Відділення / поштомат *',
    });
    expect(branchInput).toHaveValue('');
    expect(branchInput).toHaveAttribute(
      'placeholder',
      'Введіть відділення вручну або оберіть місто зі списку',
    );

    await user.type(branchInput, 'Відділення 5');
    await fillRecipient(user);
    await submitOrder(user);

    await waitFor(() => {
      expect(createOrderAction).toHaveBeenCalledWith(
        'tale-1',
        expect.objectContaining({
          city: 'Львів',
          cityRef: undefined,
          branchNumber: 'Відділення 5',
          branchRef: undefined,
        }),
      );
    });
  });

  it('clears branchRef when selected warehouse text is edited', async () => {
    mockSuccessfulDeliverySearches();
    const user = userEvent.setup();
    render(<CheckoutForm tale={tale} />);

    await selectCity(user);
    await selectWarehouse(user);
    const branchInput = screen.getByRole('combobox', {
      name: 'Відділення / поштомат *',
    });
    await user.clear(branchInput);
    await user.type(branchInput, '47 вручну');
    await fillRecipient(user);
    await submitOrder(user);

    await waitFor(() => {
      expect(createOrderAction).toHaveBeenCalledWith(
        'tale-1',
        expect.objectContaining({
          cityRef: 'city-ref',
          branchNumber: '47 вручну',
          branchRef: undefined,
        }),
      );
    });
  });

  it('clears warehouse state when switching to courier', async () => {
    mockSuccessfulDeliverySearches();
    const user = userEvent.setup();
    render(<CheckoutForm tale={tale} />);

    await selectCity(user);
    await selectWarehouse(user);
    await user.click(screen.getByRole('radio', { name: "Кур'єр" }));
    await user.click(
      screen.getByRole('radio', { name: 'Відділення / поштомат' }),
    );

    expect(
      screen.getByRole('combobox', { name: 'Відділення / поштомат *' }),
    ).toHaveValue('');
  });

  it('submits selected cityRef and branchRef', async () => {
    mockSuccessfulDeliverySearches();
    const user = userEvent.setup();
    render(<CheckoutForm tale={tale} />);

    await selectCity(user);
    await selectWarehouse(user);
    await fillRecipient(user);
    await submitOrder(user);

    await waitFor(() => {
      expect(createOrderAction).toHaveBeenCalledWith('tale-1', {
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
      });
      expect(mocks.push).toHaveBeenCalledWith('/orders/order-1');
    });
  });

  it('submits manual city and branch values without refs after API failure', async () => {
    mocks.fetch.mockResolvedValue(
      jsonResponse(
        {
          error:
            'Сервіс Нової Пошти тимчасово недоступний. Введіть місто вручну.',
        },
        { status: 502 },
      ),
    );
    const user = userEvent.setup();
    render(<CheckoutForm tale={tale} />);

    await user.type(screen.getByRole('combobox', { name: 'Місто *' }), 'Київ');
    expect(
      await screen.findByText(
        'Сервіс Нової Пошти тимчасово недоступний. Введіть місто вручну.',
        {},
        { timeout: 2_000 },
      ),
    ).toBeInTheDocument();
    await user.type(
      screen.getByRole('combobox', {
        name: 'Відділення / поштомат *',
      }),
      'Відділення 47',
    );
    await fillRecipient(user);
    await submitOrder(user);

    await waitFor(() => {
      expect(createOrderAction).toHaveBeenCalledWith(
        'tale-1',
        expect.objectContaining({
          city: 'Київ',
          cityRef: undefined,
          branchNumber: 'Відділення 47',
          branchRef: undefined,
        }),
      );
    });
  });

  it('shows error message when createOrderAction returns error', async () => {
    vi.mocked(createOrderAction).mockResolvedValueOnce({
      ok: false,
      error: 'Помилка сервера',
    });
    const user = userEvent.setup();
    render(<CheckoutForm tale={tale} />);

    await user.type(screen.getByRole('combobox', { name: 'Місто *' }), 'Київ');
    await user.type(
      screen.getByRole('combobox', {
        name: 'Відділення / поштомат *',
      }),
      '47',
    );
    await fillRecipient(user);
    await submitOrder(user);

    expect(await screen.findByText('Помилка сервера')).toBeInTheDocument();
  });
});
