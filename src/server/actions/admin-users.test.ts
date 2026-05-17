import { describe, expect, it } from 'vitest';
import {
  canAdminChangeTargetBlockedState,
  canAdminChangeTargetRole,
} from './admin-users';

describe('admin user actions', () => {
  it('allows admin to manage only customers and psychologists', () => {
    expect(canAdminChangeTargetRole('ADMIN', 'CUSTOMER')).toBe(true);
    expect(canAdminChangeTargetRole('ADMIN', 'PSYCHOLOGIST')).toBe(true);
    expect(canAdminChangeTargetRole('ADMIN', 'ADMIN')).toBe(false);
    expect(canAdminChangeTargetRole('ADMIN', 'SUPERADMIN')).toBe(false);

    expect(canAdminChangeTargetBlockedState('ADMIN', 'CUSTOMER')).toBe(true);
    expect(canAdminChangeTargetBlockedState('ADMIN', 'PSYCHOLOGIST')).toBe(true);
    expect(canAdminChangeTargetBlockedState('ADMIN', 'ADMIN')).toBe(false);
  });
});
