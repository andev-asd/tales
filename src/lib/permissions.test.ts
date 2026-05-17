import { describe, expect, it } from 'vitest';
import { getManageableRoleOptions } from './user-access';
import {
  canManageRoles,
  canManageUserRecord,
  canManageUserRole,
  canManageTales,
  canToggleUserBlockedState,
  canWorkOnPsychologistOrders,
} from './permissions';

describe('permissions', () => {
  it('grants access to the correct roles', () => {
    expect(canManageRoles('SUPERADMIN')).toBe(true);
    expect(canManageRoles('ADMIN')).toBe(false);
    expect(canManageTales('ADMIN')).toBe(true);
    expect(canWorkOnPsychologistOrders('PSYCHOLOGIST')).toBe(true);
    expect(canWorkOnPsychologistOrders('CUSTOMER')).toBe(false);
  });

  it('enforces admin and superadmin target rules', () => {
    expect(canManageRoles('SUPERADMIN')).toBe(true);
    expect(canManageRoles('ADMIN')).toBe(false);

    expect(canManageUserRole('ADMIN', 'CUSTOMER')).toBe(true);
    expect(canManageUserRole('ADMIN', 'PSYCHOLOGIST')).toBe(true);
    expect(canManageUserRole('ADMIN', 'ADMIN')).toBe(false);
    expect(canManageUserRole('ADMIN', 'SUPERADMIN')).toBe(false);

    expect(canManageUserRole('SUPERADMIN', 'ADMIN')).toBe(true);
    expect(canManageUserRole('SUPERADMIN', 'SUPERADMIN')).toBe(true);

    expect(canToggleUserBlockedState('ADMIN', 'PSYCHOLOGIST')).toBe(true);
    expect(canToggleUserBlockedState('ADMIN', 'ADMIN')).toBe(false);
    expect(canToggleUserBlockedState('SUPERADMIN', 'ADMIN')).toBe(true);

    expect(canManageUserRecord('ADMIN', 'CUSTOMER')).toBe(true);
    expect(canManageUserRecord('ADMIN', 'SUPERADMIN')).toBe(false);
    expect(canManageUserRecord('SUPERADMIN', 'SUPERADMIN')).toBe(true);

    expect(canWorkOnPsychologistOrders('ADMIN')).toBe(true);
    expect(canWorkOnPsychologistOrders('SUPERADMIN')).toBe(true);
  });

  it('returns manageable role options by actor role', () => {
    expect(getManageableRoleOptions('SUPERADMIN')).toEqual([
      'CUSTOMER',
      'PSYCHOLOGIST',
      'ADMIN',
      'SUPERADMIN',
    ]);
    expect(getManageableRoleOptions('ADMIN')).toEqual([
      'CUSTOMER',
      'PSYCHOLOGIST',
    ]);
    expect(getManageableRoleOptions('CUSTOMER')).toEqual([]);
  });
});
