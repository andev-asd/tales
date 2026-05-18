import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { UserManagementTable } from '@/src/components/superadmin/user-management-table';

describe('UserManagementTable', () => {
  it('renders admin-manageable roles and statuses', () => {
    render(
      <UserManagementTable
        actorRole="ADMIN"
        users={[
          {
            id: 'user-1',
            name: 'Ірина',
            email: 'iryna@example.com',
            role: 'PSYCHOLOGIST',
            status: 'ACTIVE',
          },
        ]}
      />,
    );

    expect(screen.getByText('Ірина')).toBeInTheDocument();
    expect(screen.getAllByText('Психолог').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Активний').length).toBeGreaterThan(0);
  });

  it('renders empty state when no users are available', () => {
    render(<UserManagementTable actorRole="ADMIN" users={[]} />);

    expect(screen.getByText('Користувачів не знайдено')).toBeInTheDocument();
  });

  it('renders superadmin role options for superadmin actor', () => {
    render(
      <UserManagementTable
        actorRole="SUPERADMIN"
        users={[
          {
            id: 'user-2',
            name: 'Олег',
            email: 'oleg@example.com',
            role: 'ADMIN',
            status: 'ACTIVE',
          },
        ]}
      />,
    );

    expect(screen.getByRole('option', { name: 'Адмін' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Суперадмін' })).toBeInTheDocument();
  });
});
