import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/src/lib/auth';
import { db } from '@/src/lib/db';
import { createSignedPdfUrl } from '@/src/lib/storage';

export async function GET(
  _: Request,
  context: { params: Promise<{ libraryItemId: string }> },
) {
  const session = await getCurrentSession().catch(() => null);
  const { libraryItemId } = await context.params;

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Потрібно увійти в акаунт' }, { status: 401 });
  }

  const appUser = await db.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!appUser) {
    return NextResponse.json({ error: 'Користувача не знайдено' }, { status: 404 });
  }

  const item = await db.libraryItem.findFirst({
    where: {
      id: libraryItemId,
      userId: appUser.id,
    },
    include: {
      tale: {
        select: {
          pdfPath: true,
        },
      },
    },
  });

  if (!item?.tale.pdfPath) {
    return NextResponse.json({ error: 'Файл для завантаження недоступний' }, { status: 404 });
  }

  const signedUrl = await createSignedPdfUrl(item.tale.pdfPath);

  return NextResponse.json({
    signedUrl,
    expiresInSeconds: 60,
  });
}
