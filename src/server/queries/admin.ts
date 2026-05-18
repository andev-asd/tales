import { db } from '@/src/lib/db';

export async function getAdminSummary() {
  const [tales, categories, orders] = await Promise.all([
    db.tale.count(),
    db.category.count(),
    db.order.count(),
  ]);

  return { tales, categories, orders };
}

export async function getAdminTales() {
  return db.tale.findMany({
    include: {
      categories: {
        include: {
          category: true,
        },
      },
    },
    orderBy: [{ homepageOrder: 'asc' }, { createdAt: 'desc' }],
  });
}

export async function getAdminCategories() {
  return db.category.findMany({
    orderBy: { name: 'asc' },
  });
}
