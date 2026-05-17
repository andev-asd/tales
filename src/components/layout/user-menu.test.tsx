import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { UserMenu } from './user-menu';

describe('UserMenu', () => {
  it('reveals account navigation items when toggled open', async () => {
    const user = userEvent.setup();

    render(
      <UserMenu
        user={{
          id: 'user-1',
          email: 'andrew@example.com',
          name: 'Andrew',
          image: null,
          role: 'SUPERADMIN',
        }}
      />,
    );

    await user.click(screen.getByRole('button', { name: /Andrew/i }));

    expect(
      screen.getByRole('menuitem', { name: 'Моя колекція' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: 'Мої замовлення' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: 'Повідомлення' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Вийти' })).toBeInTheDocument();
  });

  it('closes when clicking outside the menu', async () => {
    const user = userEvent.setup();

    render(
      <div>
        <button type="button">Outside</button>
        <UserMenu
          user={{
            id: 'user-1',
            email: 'andrew@example.com',
            name: 'Andrew',
            image: null,
            role: 'CUSTOMER',
          }}
        />
      </div>,
    );

    await user.click(screen.getByRole('button', { name: /Andrew/i }));
    expect(
      screen.getByRole('menuitem', { name: 'Моя колекція' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Outside' }));

    expect(
      screen.queryByRole('menuitem', { name: 'Моя колекція' }),
    ).not.toBeInTheDocument();
  });

  it('falls back to initial when avatar image fails to load', () => {
    render(
      <UserMenu
        user={{
          id: 'user-1',
          email: 'andrew@example.com',
          name: 'Andrew',
          image: 'https://example.com/broken.png',
          role: 'CUSTOMER',
        }}
      />,
    );

    const image = screen.getByRole('img', { name: 'Andrew' });
    fireEvent.error(image);

    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: 'Andrew' })).not.toBeInTheDocument();
  });

  it('closes the menu when a navigation link is clicked', async () => {
    const user = userEvent.setup();

    render(
      <UserMenu
        user={{
          id: 'user-1',
          email: 'andrew@example.com',
          name: 'Andrew',
          image: null,
          role: 'CUSTOMER',
        }}
      />,
    );

    await user.click(screen.getByRole('button', { name: /Andrew/i }));
    const ordersLink = screen.getByRole('menuitem', { name: 'Мої замовлення' });
    await user.click(ordersLink);

    expect(screen.queryByRole('menuitem', { name: 'Моя колекція' })).not.toBeInTheDocument();
  });
});
