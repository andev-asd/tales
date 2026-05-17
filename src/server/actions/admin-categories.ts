'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/src/lib/db';
import { normalizeCategoryInput } from '@/src/server/lib/admin-category-input';

export async function saveCategory(input: { name: string; slug: string }) {
  const category = normalizeCategoryInput(input);

  await db.category.upsert({
    where: { slug: category.slug },
    update: { name: category.name },
    create: category,
  });

  revalidatePath('/admin/categories');

  return {
    ok: true,
    category,
  };
}

export async function saveCategoryAction(formData: FormData) {
  await saveCategory({
    name: String(formData.get('name') ?? ''),
    slug: String(formData.get('slug') ?? ''),
  });

  redirect('/admin/categories');
}
