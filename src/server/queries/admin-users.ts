import type { UserRole, UserStatus } from '@/src/lib/user-types';
import { db } from '@/src/lib/db';

export type AdminUserFilters = {
  role?: 'ALL' | UserRole;
  status?: 'ALL' | UserStatus;
};

const adminManageableRoles: UserRole[] = ['CUSTOMER', 'PSYCHOLOGIST'];

export async function getAdminUsers(filters: AdminUserFilters) {
  return db.user.findMany({
    where: {
      role:
        filters.role && filters.role !== 'ALL'
          ? filters.role
          : { in: adminManageableRoles },
      ...(filters.status && filters.status !== 'ALL'
        ? { status: filters.status }
        : {}),
    },
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
  });
}
