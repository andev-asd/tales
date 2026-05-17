import { describe, expect, it } from 'vitest';

import {
  canAssignRole,
  canChangeTargetBlockedState,
  canChangeTargetRole,
} from './superadmin-users';

describe('superadmin user actions', () => {
  it('allows only superadmin to manage admin and superadmin targets', () => {
    expect(canAssignRole('SUPERADMIN')).toBe(true);
    expect(canAssignRole('ADMIN')).toBe(false);

    expect(canChangeTargetRole('SUPERADMIN', 'ADMIN')).toBe(true);
    expect(canChangeTargetRole('SUPERADMIN', 'SUPERADMIN')).toBe(true);
    expect(canChangeTargetRole('ADMIN', 'ADMIN')).toBe(false);
    expect(canChangeTargetRole('ADMIN', 'CUSTOMER')).toBe(false);

    expect(canChangeTargetBlockedState('SUPERADMIN', 'ADMIN')).toBe(true);
    expect(canChangeTargetBlockedState('SUPERADMIN', 'SUPERADMIN')).toBe(true);
    expect(canChangeTargetBlockedState('ADMIN', 'ADMIN')).toBe(false);
    expect(canChangeTargetBlockedState('ADMIN', 'CUSTOMER')).toBe(false);
  });
});
