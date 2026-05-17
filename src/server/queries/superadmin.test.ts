import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/src/lib/db', () => ({
  db: {
    user: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

import { db } from '@/src/lib/db';
import { getSuperadminSummary, getSuperadminUsers } from './superadmin';

describe('superadmin queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads summary metrics for the dashboard', async () => {
    vi.mocked(db.user.count)
      .mockResolvedValueOnce(12)
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(4);

    await expect(getSuperadminSummary()).resolves.toEqual({
      totalUsers: 12,
      blockedUsers: 3,
      admins: 2,
      psychologists: 4,
    });
  });

  it('applies role and status filters when listing users', async () => {
    vi.mocked(db.user.findMany).mockResolvedValueOnce([]);

    await getSuperadminUsers({ role: 'ADMIN', status: 'BLOCKED' });

    expect(db.user.findMany).toHaveBeenCalledWith({
      where: {
        role: 'ADMIN',
        status: 'BLOCKED',
      },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    });
  });

  it('omits filters when ALL values are requested', async () => {
    vi.mocked(db.user.findMany).mockResolvedValueOnce([]);

    await getSuperadminUsers({ role: 'ALL', status: 'ALL' });

    expect(db.user.findMany).toHaveBeenCalledWith({
      where: {},
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    });
  });
});
