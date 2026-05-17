import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { OrderStatusBadge } from '@/src/components/orders/order-status-badge';

describe('Orders page support', () => {
  it('renders status badge labels for customer orders', () => {
    render(<OrderStatusBadge label="Завершено" />);
    expect(screen.getByText('Завершено')).toBeInTheDocument();
  });
});
