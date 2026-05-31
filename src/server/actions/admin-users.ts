'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/src/lib/auth';
import { db } from '@/src/lib/db';
import { canManageUserRole, canToggleUserBlockedState } from '@/src/lib/permissions';
import type { UserRole, UserStatus } from '@/src/lib/user-types';

export function canAdminChangeTargetRole(actorRole: UserRole, targetRole: UserRole) {
  return actorRole === 'ADMIN' && canManageUserRole(actorRole, targetRole);
}

export function canAdminChangeTargetBlockedState(
  actorRole: UserRole,
  targetRole: UserRole,
) {
  return actorRole === 'ADMIN' && canToggleUserBlockedState(actorRole, targetRole);
}

async function getActorRole() {
  const session = await getCurrentSession().catch(() => null);

  if (!session?.user?.email) {
    return null;
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });

  return user?.role ?? null;
}

export async function updateAdminUserRoleAction(formData: FormData) {
  const actorRole = await getActorRole();
  const userId = String(formData.get('userId') ?? '');
  const nextRole = String(formData.get('role') ?? '') as UserRole;

  if (actorRole !== 'ADMIN' || !userId) {
    redirect('/admin/users');
  }

  const targetUser = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (
    !targetUser ||
    !canAdminChangeTargetRole(actorRole, targetUser.role) ||
    !canAdminChangeTargetRole(actorRole, nextRole)
  ) {
    redirect('/admin/users');
  }

  await db.user.update({
    where: { id: userId },
    data: { role: nextRole },
  });

  revalidatePath('/admin/users');
  redirect('/admin/users');
}

export async function updateAdminUserStatusAction(formData: FormData) {
  const actorRole = await getActorRole();
  const userId = String(formData.get('userId') ?? '');
  const nextStatus = String(formData.get('status') ?? '') as UserStatus;

  if (actorRole !== 'ADMIN' || !userId || (nextStatus !== 'ACTIVE' && nextStatus !== 'BLOCKED')) {
    redirect('/admin/users');
  }

  const targetUser = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!targetUser || !canAdminChangeTargetBlockedState(actorRole, targetUser.role)) {
    redirect('/admin/users');
  }

  await db.user.update({
    where: { id: userId },
    data: { status: nextStatus },
  });

  revalidatePath('/admin/users');
  redirect('/admin/users');
}
