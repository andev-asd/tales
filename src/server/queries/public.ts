import { db } from '@/src/lib/db';
import { getPublicImageUrl } from '@/src/lib/storage';

export async function getPublishedTales() {
  return db.tale.findMany({
    where: { published: true },
    include: {
      categories: {
        include: {
          category: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getFeaturedHomepageTales() {
  const tales = await db.tale.findMany({
    where: { published: true, publishOnHomepage: true },
    orderBy: [{ homepageOrder: 'asc' }, { createdAt: 'desc' }],
    select: {
      id: true,
      title: true,
      slug: true,
      shortDescription: true,
      accessType: true,
      coverPath: true,
    },
  });

  return tales.map((tale: (typeof tales)[number]) => ({
    ...tale,
    coverUrl: tale.coverPath ? getPublicImageUrl(tale.coverPath) : null,
  }));
}

export async function getPublishedTaleBySlug(slug: string) {
  return db.tale.findUnique({
    where: { slug },
    include: {
      categories: {
        include: {
          category: true,
        },
      },
    },
  });
}
