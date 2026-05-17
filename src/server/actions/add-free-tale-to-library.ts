'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentSession } from '@/src/lib/auth';
import { db } from '@/src/lib/db';

export async function addFreeTaleToLibraryAction(taleId: string) {
  const session = await getCurrentSession();

  if (!session?.user?.email) {
    return { ok: false, message: 'Увійдіть, щоб додати казку до колекції' };
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return { ok: false, message: 'Користувача не знайдено' };
  }

  const tale = await db.tale.findUnique({
    where: { id: taleId },
    select: { accessType: true, published: true },
  });

  if (!tale || !tale.published || tale.accessType !== 'FREE') {
    return { ok: false, message: 'Казку не можна додати до колекції' };
  }

  await db.libraryItem.upsert({
    where: {
      userId_taleId_source: {
        userId: user.id,
        taleId,
        source: 'FREE_ADDED',
      },
    },
    update: {},
    create: {
      userId: user.id,
      taleId,
      source: 'FREE_ADDED',
    },
  });

  revalidatePath('/library');
  return { ok: true, message: 'Казку додано до колекції' };
}
