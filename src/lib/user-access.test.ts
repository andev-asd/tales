import { describe, expect, it } from 'vitest';
import { getUserStatusLabel, isBlockedStatus } from './user-access';

describe('user access helpers', () => {
  it('maps statuses to Ukrainian labels and blocked flag', () => {
    expect(getUserStatusLabel('ACTIVE')).toBe('Активний');
    expect(getUserStatusLabel('BLOCKED')).toBe('Заблокований');
    expect(isBlockedStatus('ACTIVE')).toBe(false);
    expect(isBlockedStatus('BLOCKED')).toBe(true);
  });
});
