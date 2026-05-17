import { describe, expect, it } from 'vitest';
import { normalizeCategoryInput } from '@/src/server/lib/admin-category-input';

describe('admin category actions', () => {
  it('normalizes category input for create/edit flow', () => {
    expect(
      normalizeCategoryInput({
        name: '  Сон  ',
        slug: '  SON  ',
      }),
    ).toEqual({
      name: 'Сон',
      slug: 'son',
    });
  });
});
