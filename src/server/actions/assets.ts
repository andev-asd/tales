import { db } from '@/src/lib/db';
import { getBooksBucketName, getImageBucketName, getStorageAdmin } from '@/src/lib/storage';

export function buildImageAssetPath(fileName: string) {
  return `images/${Date.now()}-${fileName}`;
}

export function buildBookAssetPath(fileName: string) {
  return `books/${Date.now()}-${fileName}`;
}

export function validateAssetFile(file: File, kind: 'image' | 'book') {
  if (kind === 'image') {
    if (!file.type.startsWith('image/')) {
      throw new Error('Потрібно завантажити зображення');
    }
    return;
  }

  if (file.type !== 'application/pdf') {
    throw new Error('Потрібно завантажити PDF');
  }
}

export function getAssetPayload(file: File) {
  return file.arrayBuffer();
}

export async function deleteAsset(bucket: string, path: string) {
  const { error } = await getStorageAdmin().storage.from(bucket).remove([path]);

  if (error) {
    throw new Error('Не вдалося видалити файл');
  }
}

export async function assetExists(bucket: string, path: string) {
  const lastSlashIndex = path.lastIndexOf('/');
  const folder = lastSlashIndex >= 0 ? path.slice(0, lastSlashIndex) : '';
  const fileName = lastSlashIndex >= 0 ? path.slice(lastSlashIndex + 1) : path;
  const { data, error } = await getStorageAdmin().storage.from(bucket).list(folder, {
    search: fileName,
  });

  if (error) {
    throw new Error('Не вдалося перевірити файл');
  }

  return (data ?? []).some((item: { name: string }) => item.name === fileName);
}

function getFileName(file: File) {
  return file.name;
}

function normalizeGalleryPaths(value: unknown) {
  return Array.isArray(value) ? value.filter((item: unknown): item is string => typeof item === 'string' && item.length > 0) : [];
}

export async function syncTaleAssetDelete(taleId: string, kind: 'image' | 'book', path: string) {
  const tale = await db.tale.findUnique({
    where: { id: taleId },
    select: { coverPath: true, galleryPaths: true, pdfPath: true },
  });

  if (!tale) {
    throw new Error('Казку не знайдено');
  }

  if (kind === 'book') {
    if (tale.pdfPath !== path) {
      throw new Error('PDF не привʼязаний до цієї казки');
    }

    await deleteAsset(getBooksBucketName(), path);
    await db.tale.update({
      where: { id: taleId },
      data: { pdfPath: null },
    });
    return;
  }

  const imagePaths = [
    ...(tale.coverPath ? [tale.coverPath] : []),
    ...normalizeGalleryPaths(tale.galleryPaths),
  ];

  if (!imagePaths.includes(path)) {
    throw new Error('Зображення не привʼязане до цієї казки');
  }

  await deleteAsset(getImageBucketName(), path);

  const nextImagePaths = imagePaths.filter((item: string) => item !== path);
  await db.tale.update({
    where: { id: taleId },
    data: {
      coverPath: nextImagePaths[0] ?? null,
      galleryPaths: nextImagePaths.slice(1),
    },
  });
}

export async function syncTaleAssetUpload(taleId: string, file: File, kind: 'image' | 'book') {
  const tale = await db.tale.findUnique({
    where: { id: taleId },
    select: { coverPath: true, galleryPaths: true, pdfPath: true },
  });

  if (!tale) {
    throw new Error('Казку не знайдено');
  }

  const asset = await uploadAsset(file, kind);

  if (kind === 'book') {
    if (tale.pdfPath) {
      await deleteAsset(getBooksBucketName(), tale.pdfPath);
    }

    await db.tale.update({
      where: { id: taleId },
      data: { pdfPath: asset.path },
    });

    return asset;
  }

  const imagePaths = [
    ...(tale.coverPath ? [tale.coverPath] : []),
    ...normalizeGalleryPaths(tale.galleryPaths),
    asset.path,
  ];

  await db.tale.update({
    where: { id: taleId },
    data: {
      coverPath: imagePaths[0] ?? null,
      galleryPaths: imagePaths.slice(1),
    },
  });

  return asset;
}

export async function uploadAsset(file: File, kind: 'image' | 'book') {
  validateAssetFile(file, kind);

  const storage = getStorageAdmin().storage;
  const bucket = kind === 'image' ? getImageBucketName() : getBooksBucketName();
  const path = kind === 'image' ? buildImageAssetPath(getFileName(file)) : buildBookAssetPath(getFileName(file));
  const payload = await getAssetPayload(file);

  const { error } = await storage.from(bucket).upload(path, payload, {
    contentType: file.type,
    upsert: true,
  });

  if (error) {
    throw new Error('Не вдалося завантажити файл');
  }

  const displayUrl = kind === 'image'
    ? getStorageAdmin().storage.from(bucket).getPublicUrl(path).data.publicUrl
    : null;

  return { bucket, path, displayUrl, fileName: getFileName(file) };
}

export async function replaceAsset(
  file: File,
  kind: 'image' | 'book',
  existingAsset: { bucket: string; path: string },
) {
  await deleteAsset(existingAsset.bucket, existingAsset.path);
  return uploadAsset(file, kind);
}
