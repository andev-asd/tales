import { db } from '@/src/lib/db';
import { getPublicImageUrl } from '@/src/lib/storage';

export async function getCatalogTales() {
  const tales = await db.tale.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      shortDescription: true,
      accessType: true,
      coverPath: true,
      galleryPaths: true,
    },
  });

  return tales.map((tale: (typeof tales)[number]) => ({
    ...tale,
    galleryPaths: Array.isArray(tale.galleryPaths) ? tale.galleryPaths.filter((item: unknown): item is string => typeof item === 'string') : [],
    coverUrl: tale.coverPath ? getPublicImageUrl(tale.coverPath) : null,
  }));
}

export async function getCatalogTaleBySlug(slug: string) {
  const tale = await db.tale.findFirst({
    where: { slug, published: true },
    select: {
      id: true,
      title: true,
      slug: true,
      shortDescription: true,
      fullDescription: true,
      accessType: true,
      coverPath: true,
      galleryPaths: true,
    },
  });

  if (!tale) {
    return null;
  }

  const galleryPaths = Array.isArray(tale.galleryPaths) ? tale.galleryPaths.filter((item: unknown): item is string => typeof item === 'string') : [];

  return {
    ...tale,
    galleryPaths,
    galleryUrls: galleryPaths.map((path: string) => getPublicImageUrl(path)),
    coverUrl: tale.coverPath ? getPublicImageUrl(tale.coverPath) : null,
  };
}
