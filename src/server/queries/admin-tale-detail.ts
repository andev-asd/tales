import { db } from '@/src/lib/db';
import { getImageBucketName, getPublicImageUrl } from '@/src/lib/storage';
import { assetExists } from '@/src/server/actions/assets';

type StoredImageCheck = {
  path: string;
  exists: boolean;
};

export async function getAdminTaleDetail(id: string) {
  const tale = await db.tale.findUnique({
    where: { id },
    include: {
      categories: {
        include: {
          category: true,
        },
      },
    },
  });

  if (!tale) {
    return null;
  }

  const storedImagePaths = [
    ...(tale.coverPath ? [tale.coverPath] : []),
    ...(Array.isArray(tale.galleryPaths) ? tale.galleryPaths.filter((item: unknown): item is string => typeof item === 'string') : []),
  ];
  const imageChecks = await Promise.all(storedImagePaths.map(async (path) => ({
    path,
    exists: await assetExists(getImageBucketName(), path),
  })));
  const imagePaths = imageChecks.filter((item: StoredImageCheck) => item.exists).map((item: StoredImageCheck) => item.path);

  if (imagePaths.length !== storedImagePaths.length) {
    await db.tale.update({
      where: { id },
      data: {
        coverPath: imagePaths[0] ?? null,
        galleryPaths: imagePaths.slice(1),
      },
    });
  }

  return {
    ...tale,
    coverPath: imagePaths[0] ?? null,
    galleryPaths: imagePaths.slice(1),
    imagePaths,
    imagePreviewUrls: imagePaths.map((path: string) => getPublicImageUrl(path)),
  };
}
