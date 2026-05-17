import { describe, expect, it } from 'vitest';
import {
  canTransitionPsychologistOrder,
  normalizePsychologistResult,
} from './psychologist-orders';

describe('psychologist order actions', () => {
  it('allows only the approved psychologist status transitions', () => {
    expect(canTransitionPsychologistOrder('NEW', 'IN_REVIEW')).toBe(true);
    expect(canTransitionPsychologistOrder('IN_REVIEW', 'IN_PROGRESS')).toBe(true);
    expect(canTransitionPsychologistOrder('IN_PROGRESS', 'AWAITING_CUSTOMER')).toBe(true);
    expect(canTransitionPsychologistOrder('IN_PROGRESS', 'COMPLETED')).toBe(true);
    expect(canTransitionPsychologistOrder('AWAITING_CUSTOMER', 'IN_PROGRESS')).toBe(true);
    expect(canTransitionPsychologistOrder('AWAITING_CUSTOMER', 'COMPLETED')).toBe(true);

    expect(canTransitionPsychologistOrder('NEW', 'IN_PROGRESS')).toBe(false);
    expect(canTransitionPsychologistOrder('IN_REVIEW', 'COMPLETED')).toBe(false);
    expect(canTransitionPsychologistOrder('COMPLETED', 'IN_PROGRESS')).toBe(false);
    expect(canTransitionPsychologistOrder('CANCELLED', 'IN_REVIEW')).toBe(false);
  });

  it('trims psychologist result fields and converts empty values to null', () => {
    expect(
      normalizePsychologistResult({
        resultTitle: '  Calm Forest  ',
        resultBody: '  A bedtime story body.  ',
      }),
    ).toEqual({
      resultTitle: 'Calm Forest',
      resultBody: 'A bedtime story body.',
    });

    expect(
      normalizePsychologistResult({
        resultTitle: '   ',
        resultBody: '',
      }),
    ).toEqual({
      resultTitle: null,
      resultBody: null,
    });
  });
});
