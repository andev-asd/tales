import { describe, expect, it } from 'vitest';
import {
  mapLibraryItemForView,
  mapOrderForView,
  mapOrderMessageForView,
} from './customer-data';

describe('customer data mappers', () => {
  it('maps library item to customer card view', () => {
    expect(
      mapLibraryItemForView({
        tale: { title: 'Ніч без страху' },
        source: 'FREE_ADDED',
      }),
    ).toEqual({
      title: 'Ніч без страху',
      status: 'Безкоштовно додано',
    });
  });

  it('maps order to customer view', () => {
    expect(
      mapOrderForView({
        type: 'CUSTOM_PSYCHOLOGIST',
        status: 'IN_PROGRESS',
        hasAccessibleResult: false,
      }),
    ).toEqual({
      typeLabel: 'Індивідуальна казка з психологом',
      statusLabel: 'У роботі',
      resultStateLabel: 'Результат ще готується',
    });
  });

  it('marks completed customer order as available when result is accessible', () => {
    expect(
      mapOrderForView({
        type: 'CUSTOM_PSYCHOLOGIST',
        status: 'COMPLETED',
        hasAccessibleResult: true,
      }),
    ).toEqual({
      typeLabel: 'Індивідуальна казка з психологом',
      statusLabel: 'Завершено',
      resultStateLabel: 'Казка вже доступна у бібліотеці',
    });
  });

  it('maps order message to UI view', () => {
    expect(
      mapOrderMessageForView({
        id: 'message-1',
        author: { role: 'PSYCHOLOGIST', name: 'Олена' },
        body: 'Я вже в роботі над історією.',
        createdAt: new Date('2026-05-15T10:00:00Z'),
      }),
    ).toEqual({
      id: 'message-1',
      authorLabel: 'Психолог',
      body: 'Я вже в роботі над історією.',
      createdAt: '2026-05-15T10:00:00.000Z',
    });
  });
});
