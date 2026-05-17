import { beforeEach, describe, expect, it, vi } from 'vitest';

const { countMock, findManyMock, findFirstMock } = vi.hoisted(() => ({
  countMock: vi.fn(),
  findManyMock: vi.fn(),
  findFirstMock: vi.fn(),
}));

vi.mock('@/src/lib/db', () => ({
  db: {
    order: {
      count: countMock,
      findMany: findManyMock,
      findFirst: findFirstMock,
    },
  },
}));

import {
  getPsychologistInbox,
  getPsychologistOrderDetail,
  getPsychologistSummary,
} from './psychologist';

describe('psychologist queries', () => {
  beforeEach(() => {
    countMock.mockReset();
    findManyMock.mockReset();
    findFirstMock.mockReset();
  });

  it('loads only custom psychologist orders into the inbox', async () => {
    findManyMock.mockResolvedValueOnce([]);

    await getPsychologistInbox();

    expect(findManyMock).toHaveBeenCalledWith({
      where: {
        type: 'CUSTOM_PSYCHOLOGIST',
      },
      include: {
        customer: true,
        tale: true,
      },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    });
  });

  it('loads psychologist order detail with customer tale and messages', async () => {
    findFirstMock.mockResolvedValueOnce(null);

    await getPsychologistOrderDetail('order-123');

    expect(findFirstMock).toHaveBeenCalledWith({
      where: {
        id: 'order-123',
        type: 'CUSTOM_PSYCHOLOGIST',
      },
      include: {
        customer: true,
        tale: true,
        messages: {
          include: {
            author: true,
          },
          orderBy: [{ createdAt: 'asc' }],
        },
      },
    });
  });

  it('keeps the existing summary scoped to custom psychologist orders', async () => {
    countMock.mockResolvedValueOnce(4);

    await expect(getPsychologistSummary()).resolves.toBe(4);

    expect(countMock).toHaveBeenCalledWith({
      where: {
        type: 'CUSTOM_PSYCHOLOGIST',
      },
    });
  });
});
