import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const { getPsychologistInboxMock } = vi.hoisted(() => ({
  getPsychologistInboxMock: vi.fn(),
}));

vi.mock('@/src/server/queries/psychologist', () => ({
  getPsychologistInbox: getPsychologistInboxMock,
}));

import PsychologistPage from './page';

describe('PsychologistOrderInboxCard', () => {
  it('renders psychologist inbox cards with order details', async () => {
    getPsychologistInboxMock.mockResolvedValueOnce([
      {
        id: 'order-1',
        status: 'NEW',
        createdAt: new Date('2026-05-16T10:00:00.000Z'),
        childName: 'Левко',
        childAge: 7,
        requestNote: 'Боиться темряви',
        customer: {
          id: 'customer-1',
          name: 'Олена',
          email: 'olena@example.com',
        },
        tale: null,
      },
    ]);

    render(await PsychologistPage());

    expect(screen.getByText('Мої індивідуальні замовлення')).toBeInTheDocument();
    expect(screen.getByText('Левко')).toBeInTheDocument();
    expect(screen.getByText('Боиться темряви')).toBeInTheDocument();
    expect(screen.getByText('Олена')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Відкрити замовлення' }),
    ).toHaveAttribute('href', '/psychologist/orders/order-1');
  });
});
