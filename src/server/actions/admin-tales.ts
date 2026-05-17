'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/src/lib/db';
import { normalizeTaleInput } from '@/src/server/lib/admin-tale-input';

export async function createTaleAction(formData: FormData) {
  const payload = normalizeTaleInput({
    title: String(formData.get('title') ?? ''),
    slug: String(formData.get('slug') ?? ''),
    shortDescription: String(formData.get('shortDescription') ?? ''),
    fullDescription: String(formData.get('fullDescription') ?? ''),
    accessType: String(formData.get('accessType') ?? 'FREE') as 'FREE' | 'PAID' | 'PERSONALIZABLE',
    price: String(formData.get('price') ?? ''),
    personalizationPrice: String(formData.get('personalizationPrice') ?? ''),
    published: formData.get('published') === 'on',
    categoryIds: formData.getAll('categoryIds').map(String),
    galleryPaths: formData.getAll('imagePaths').map(String),
    pdfPath: String(formData.get('pdfPath') ?? ''),
  });

  await db.tale.create({
    data: {
      title: payload.title,
      slug: payload.slug,
      shortDescription: payload.shortDescription,
      fullDescription: payload.fullDescription,
      accessType: payload.accessType,
      price: payload.price,
      personalizationPrice: payload.personalizationPrice,
      published: payload.published,
      coverPath: payload.galleryPaths[0] ?? null,
      galleryPaths: payload.galleryPaths.slice(1),
      pdfPath: payload.pdfPath,
      categories: payload.categoryIds.length
        ? { create: payload.categoryIds.map((categoryId) => ({ categoryId })) }
        : undefined,
    },
  });

  revalidatePath('/admin/tales');
  revalidatePath('/catalog');

  redirect('/admin/tales');
}

export async function updateTaleAction(id: string, formData: FormData) {
  const payload = normalizeTaleInput({
    title: String(formData.get('title') ?? ''),
    slug: String(formData.get('slug') ?? ''),
    shortDescription: String(formData.get('shortDescription') ?? ''),
    fullDescription: String(formData.get('fullDescription') ?? ''),
    accessType: String(formData.get('accessType') ?? 'FREE') as 'FREE' | 'PAID' | 'PERSONALIZABLE',
    price: String(formData.get('price') ?? ''),
    personalizationPrice: String(formData.get('personalizationPrice') ?? ''),
    published: formData.get('published') === 'on',
    categoryIds: formData.getAll('categoryIds').map(String),
    galleryPaths: formData.getAll('imagePaths').map(String),
    pdfPath: String(formData.get('pdfPath') ?? ''),
  });

  await db.tale.update({
    where: { id },
    data: {
      title: payload.title,
      slug: payload.slug,
      shortDescription: payload.shortDescription,
      fullDescription: payload.fullDescription,
      accessType: payload.accessType,
      price: payload.price,
      personalizationPrice: payload.personalizationPrice,
      published: payload.published,
      coverPath: payload.galleryPaths[0] ?? null,
      galleryPaths: payload.galleryPaths.slice(1),
      pdfPath: payload.pdfPath,
      categories: {
        deleteMany: {},
        create: payload.categoryIds.map((categoryId) => ({ categoryId })),
      },
    },
  });

  revalidatePath('/admin/tales');
  revalidatePath(`/admin/tales/${id}`);
  revalidatePath('/catalog');
  revalidatePath(`/tales/${payload.slug}`);

  redirect(`/admin/tales/${id}`);
}
