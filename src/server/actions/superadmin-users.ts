import type { UserRole } from '@/src/lib/user-types';
import {
  canManageRoles,
  canToggleUserBlockedState,
} from '@/src/lib/permissions';

const superadminManageableRoles = [
  'CUSTOMER',
  'PSYCHOLOGIST',
  'ADMIN',
  'SUPERADMIN',
] satisfies UserRole[];

export function canAssignRole(role: UserRole) {
  return canManageRoles(role);
}

export function canChangeTargetRole(actorRole: UserRole, targetRole: UserRole) {
  if (actorRole !== 'SUPERADMIN') {
    return false;
  }

  return superadminManageableRoles.includes(targetRole);
}

export function canChangeTargetBlockedState(
  actorRole: UserRole,
  targetRole: UserRole,
) {
  return actorRole === 'SUPERADMIN' && canToggleUserBlockedState(actorRole, targetRole);
}
