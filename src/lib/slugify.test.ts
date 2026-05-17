import { describe, expect, it } from 'vitest';
import { slugifyTitle, transliterateUkrainian } from './slugify';

describe('slugify helpers', () => {
  it('transliterates Ukrainian Cyrillic into latin', () => {
    expect(transliterateUkrainian('Казка про їжачка')).toBe('kazka pro yizhachka');
  });

  it('builds a slug from Ukrainian title', () => {
    expect(slugifyTitle('Казка про їжачка')).toBe('kazka-pro-yizhachka');
    expect(slugifyTitle('Ніч без страху!')).toBe('nich-bez-strakhu');
  });
});
