import { describe, expect, it } from 'vitest';
import { formatPriceLabel, normalizeTalePrice } from '@/src/server/lib/admin-tale-input';

describe('admin tale actions', () => {
  it('normalizes empty and numeric price values for admin forms', () => {
    expect(normalizeTalePrice('')).toBeNull();
    expect(normalizeTalePrice(' 300 ')).toBe(300);
    expect(formatPriceLabel(null)).toBe('Без ціни');
    expect(formatPriceLabel(300)).toBe('300 грн');
  });
});
