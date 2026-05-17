import { NextResponse } from 'next/server';
import { deleteAsset, replaceAsset, syncTaleAssetDelete, syncTaleAssetUpload, uploadAsset } from '@/src/server/actions/assets';
import { getBooksBucketName, getImageBucketName } from '@/src/lib/storage';

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file');
  const kind = formData.get('kind');
  const action = formData.get('action') ?? 'upload';
  const existingPath = formData.get('existingPath');
  const taleId = formData.get('taleId');

  if (kind !== 'image' && kind !== 'book') {
    return NextResponse.json({ error: 'Невідомий тип файлу' }, { status: 400 });
  }

  try {
    if (action === 'delete') {
      if (typeof existingPath !== 'string') {
        return NextResponse.json({ error: 'Немає файлу для видалення' }, { status: 400 });
      }
      if (typeof taleId === 'string') {
        await syncTaleAssetDelete(taleId, kind, existingPath);
        return NextResponse.json({ ok: true });
      }
      await deleteAsset(kind === 'image' ? getImageBucketName() : getBooksBucketName(), existingPath);
      return NextResponse.json({ ok: true });
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Файл не передано' }, { status: 400 });
    }

    if (action === 'replace') {
      if (typeof existingPath !== 'string') {
        return NextResponse.json({ error: 'Немає файлу для заміни' }, { status: 400 });
      }
      const asset = await replaceAsset(file, kind, {
        bucket: kind === 'image' ? getImageBucketName() : getBooksBucketName(),
        path: existingPath,
      });
      return NextResponse.json(asset);
    }

    const asset = typeof taleId === 'string'
      ? await syncTaleAssetUpload(taleId, file, kind)
      : await uploadAsset(file, kind);
    return NextResponse.json(asset);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Не вдалося обробити файл' },
      { status: 400 },
    );
  }
}
