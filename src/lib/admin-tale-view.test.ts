import { describe, expect, it } from 'vitest';
import { mapAdminTaleForView } from './admin-tale-view';

describe('mapAdminTaleForView', () => {
  it('maps admin tale row into readable UI fields', () => {
    expect(
      mapAdminTaleForView({
        title: 'Ніч без страху',
        accessType: 'FREE',
        published: true,
        price: null,
        personalizationPrice: 250,
      }),
    ).toEqual({
      title: 'Ніч без страху',
      accessLabel: 'Безкоштовна',
      publishLabel: 'Опубліковано',
      priceLabel: 'Без ціни',
      personalizationPriceLabel: '250 грн',
    });
  });
});
