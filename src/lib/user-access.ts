import type { UserRole, UserStatus } from '@/src/lib/user-types';

const userRoleLabels: Record<UserRole, string> = {
  CUSTOMER: 'Користувач',
  PSYCHOLOGIST: 'Психолог',
  ADMIN: 'Адмін',
  SUPERADMIN: 'Суперадмін',
};

const userStatusLabels: Record<UserStatus, string> = {
  ACTIVE: 'Активний',
  BLOCKED: 'Заблокований',
};

const manageableRoleOptions = {
  SUPERADMIN: ['CUSTOMER', 'PSYCHOLOGIST', 'ADMIN', 'SUPERADMIN'],
  ADMIN: ['CUSTOMER', 'PSYCHOLOGIST'],
  PSYCHOLOGIST: [],
  CUSTOMER: [],
} satisfies Record<UserRole, readonly UserRole[]>;

export function getUserStatusLabel(status: UserStatus) {
  return userStatusLabels[status];
}

export function isBlockedStatus(status: UserStatus) {
  return status === 'BLOCKED';
}

export function getUserRoleLabel(role: UserRole) {
  return userRoleLabels[role];
}

export function getManageableRoleOptions(actorRole: UserRole) {
  return manageableRoleOptions[actorRole];
}
