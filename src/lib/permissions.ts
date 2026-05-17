import type { UserRole } from '@/src/lib/user-types';

export function canManageRoles(role: UserRole) {
  return role === 'SUPERADMIN';
}

export function canManageTales(role: UserRole) {
  return role === 'ADMIN' || role === 'SUPERADMIN';
}

export function canWorkOnPsychologistOrders(role: UserRole) {
  return role === 'PSYCHOLOGIST' || role === 'ADMIN' || role === 'SUPERADMIN';
}

export function canManageUserRecord(actorRole: UserRole, targetRole: UserRole) {
  if (actorRole === 'SUPERADMIN') {
    return true;
  }

  if (actorRole === 'ADMIN') {
    return targetRole === 'CUSTOMER' || targetRole === 'PSYCHOLOGIST';
  }

  return false;
}

export function canManageUserRole(actorRole: UserRole, targetRole: UserRole) {
  return canManageUserRecord(actorRole, targetRole);
}

export function canToggleUserBlockedState(actorRole: UserRole, targetRole: UserRole) {
  return canManageUserRecord(actorRole, targetRole);
}
