import {
  canManageUserRole,
  canToggleUserBlockedState,
} from '@/src/lib/permissions';
import type { UserRole } from '@/src/lib/user-types';

export function canAdminChangeTargetRole(
  actorRole: UserRole,
  targetRole: UserRole,
) {
  return actorRole === 'ADMIN' && canManageUserRole(actorRole, targetRole);
}

export function canAdminChangeTargetBlockedState(
  actorRole: UserRole,
  targetRole: UserRole,
) {
  return (
    actorRole === 'ADMIN' &&
    canToggleUserBlockedState(actorRole, targetRole)
  );
}
