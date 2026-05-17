import { db } from '@/src/lib/db';

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
