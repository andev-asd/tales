import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { UserFilters } from '@/src/components/superadmin/user-filters';
import { UserManagementTable } from '@/src/components/superadmin/user-management-table';

describe('UserManagementTable', () => {
  it('renders role and status labels for users', () => {
    render(
      <UserManagementTable
        actorRole="SUPERADMIN"
        users={[
          {
            id: 'user-1',
            name: 'Марія',
            email: 'maria@example.com',
            role: 'ADMIN',
            status: 'ACTIVE',
          },
        ]}
      />,
    );

    expect(screen.getByText('Марія')).toBeInTheDocument();
    expect(screen.getAllByText('Адмін')).toHaveLength(2);
    expect(screen.getByText('Поточний статус: Активний')).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'Суперадмін' }),
    ).toBeInTheDocument();
  });

  it('renders an empty state when no users match filters', () => {
    render(<UserManagementTable actorRole="SUPERADMIN" users={[]} />);

    expect(screen.getByText('Користувачів не знайдено')).toBeInTheDocument();
    expect(
      screen.getByText('Спробуйте змінити фільтри або перевірити статуси ролей.'),
    ).toBeInTheDocument();
  });
});

describe('UserFilters', () => {
  it('keeps the selected role and status values in the filter form', () => {
    render(<UserFilters selectedRole="ADMIN" selectedStatus="BLOCKED" />);

    expect(screen.getByLabelText('Роль')).toHaveValue('ADMIN');
    expect(screen.getByLabelText('Статус')).toHaveValue('BLOCKED');
  });
});
