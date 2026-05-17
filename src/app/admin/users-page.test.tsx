import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AdminUserManagementTable } from '@/src/components/admin/user-management-table';

describe('AdminUserManagementTable', () => {
  it('renders only admin-manageable roles and statuses', () => {
    render(
      <AdminUserManagementTable
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
    render(<AdminUserManagementTable actorRole="ADMIN" users={[]} />);

    expect(screen.getByText('Користувачів не знайдено')).toBeInTheDocument();
  });
});
