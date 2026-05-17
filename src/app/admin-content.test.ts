import { describe, expect, it } from 'vitest';
import { mapAdminCategoryForView } from './admin-content';

describe('mapAdminCategoryForView', () => {
  it('maps category to a simple admin row view', () => {
    expect(
      mapAdminCategoryForView({
        name: 'Страхи',
        slug: 'strakhy',
      }),
    ).toEqual({
      title: 'Страхи',
      slug: 'strakhy',
    });
  });
});
