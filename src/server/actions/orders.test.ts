import { describe, expect, it } from 'vitest';
import { mapOrderTypeLabel } from './orders';

describe('mapOrderTypeLabel', () => {
  it('maps all MVP order types to Ukrainian labels', () => {
    expect(mapOrderTypeLabel('ready_tale')).toBe('Готова казка');
    expect(mapOrderTypeLabel('personalized_template')).toBe(
      'Персоналізація шаблону',
    );
    expect(mapOrderTypeLabel('custom_psychologist')).toBe(
      'Індивідуальна казка з психологом',
    );
  });
});
