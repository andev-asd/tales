import { describe, expect, it } from 'vitest';
import { mapMessageAuthorLabel } from './messages';

describe('mapMessageAuthorLabel', () => {
  it('returns Ukrainian labels for message authors', () => {
    expect(mapMessageAuthorLabel('customer')).toBe('Клієнт');
    expect(mapMessageAuthorLabel('psychologist')).toBe('Психолог');
    expect(mapMessageAuthorLabel('admin')).toBe('Адміністратор');
  });
});
