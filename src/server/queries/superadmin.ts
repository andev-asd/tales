import type { UserRole, UserStatus } from '@/src/lib/user-types';
import { db } from '@/src/lib/db';

export type SuperadminUserFilters = {
  role?: UserRole | 'ALL';
  status?: UserStatus | 'ALL';
};

export async function getUserCount() {
  return db.user.count();
}

export async function getSuperadminSummary() {
  const [totalUsers, blockedUsers, admins, psychologists] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { status: 'BLOCKED' } }),
    db.user.count({ where: { role: 'ADMIN' } }),
    db.user.count({ where: { role: 'PSYCHOLOGIST' } }),
  ]);

  return { totalUsers, blockedUsers, admins, psychologists };
}

export async function getSuperadminUsers(filters: SuperadminUserFilters) {
  return db.user.findMany({
    where: {
      ...(filters.role && filters.role !== 'ALL' ? { role: filters.role } : {}),
      ...(filters.status && filters.status !== 'ALL'
        ? { status: filters.status }
        : {}),
    },
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
  });
}
