import { beforeEach, describe, expect, it, vi } from 'vitest';

const { findManyMock } = vi.hoisted(() => ({
  findManyMock: vi.fn(),
}));

vi.mock('@/src/lib/db', () => ({
  db: {
    user: {
      findMany: findManyMock,
    },
  },
}));

import { getAdminUsers } from './admin-users';

describe('getAdminUsers', () => {
  beforeEach(() => {
    findManyMock.mockReset();
  });

  it('limits admin queries to customer and psychologist roles', async () => {
    findManyMock.mockResolvedValueOnce([]);

    await getAdminUsers({ role: 'ALL', status: 'ALL' });

    expect(findManyMock).toHaveBeenCalledWith({
      where: {
        role: { in: ['CUSTOMER', 'PSYCHOLOGIST'] },
      },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    });
  });
});
