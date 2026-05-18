'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ZodError } from 'zod';
import { db } from '@/src/lib/db';
import type { TaleFormField, TaleFormState } from '@/src/lib/tale-form-state';
import { normalizeTaleInput } from '@/src/server/lib/admin-tale-input';

type TalePayload = ReturnType<typeof normalizeTaleInput>;

function getTalePayload(formData: FormData): TalePayload {
  return normalizeTaleInput({
    title: String(formData.get('title') ?? ''),
    slug: String(formData.get('slug') ?? ''),
    shortDescription: String(formData.get('shortDescription') ?? ''),
    fullDescription: String(formData.get('fullDescription') ?? ''),
    accessType: String(formData.get('accessType') ?? 'FREE') as 'FREE' | 'PAID' | 'PERSONALIZABLE',
    price: String(formData.get('price') ?? ''),
    personalizationPrice: String(formData.get('personalizationPrice') ?? ''),
    published: formData.get('published') === 'on',
    publishOnHomepage: formData.get('publishOnHomepage') === 'on',
    homepageOrder: Number(formData.get('homepageOrder') ?? 0),
    categoryIds: formData.getAll('categoryIds').map(String),
    galleryPaths: formData.getAll('imagePaths').map(String),
    pdfPath: String(formData.get('pdfPath') ?? ''),
  });
}

function getTaleData(payload: TalePayload) {
  return {
    title: payload.title,
    slug: payload.slug,
    shortDescription: payload.shortDescription,
    fullDescription: payload.fullDescription,
    accessType: payload.accessType,
    price: payload.price,
    personalizationPrice: payload.personalizationPrice,
    published: payload.published,
    publishOnHomepage: payload.publishOnHomepage,
    homepageOrder: payload.homepageOrder,
    coverPath: payload.galleryPaths[0] ?? null,
    galleryPaths: payload.galleryPaths.slice(1),
    pdfPath: payload.pdfPath,
  };
}

function getCategoryCreateData(categoryIds: string[]) {
  return categoryIds.map((categoryId: string) => ({ categoryId }));
}

function revalidateTalePaths(id?: string) {
  revalidatePath('/');
  revalidatePath('/catalog');
  revalidatePath('/admin/tales');

  if (id) {
    revalidatePath(`/admin/tales/${id}`);
  }
}

function toValidationErrorState(error: ZodError): TaleFormState {
  const flattened = error.flatten() as {
    fieldErrors: Partial<Record<TaleFormField, string[]>>;
  };

  return {
    status: 'error',
    message: 'Перевірте обов’язкові поля форми.',
    fieldErrors: {
      title: flattened.fieldErrors.title,
      slug: flattened.fieldErrors.slug,
      shortDescription: flattened.fieldErrors.shortDescription,
      fullDescription: flattened.fieldErrors.fullDescription,
    },
  };
}

function toSaveErrorState(message = 'Не вдалося зберегти казку. Спробуйте ще раз.'): TaleFormState {
  return {
    status: 'error',
    message,
  };
}

export async function createTaleAction(_prevState: TaleFormState, formData: FormData) {
  let payload: TalePayload;

  try {
    payload = getTalePayload(formData);
  } catch (error) {
    if (error instanceof ZodError) {
      return toValidationErrorState(error);
    }

    return toSaveErrorState();
  }

  try {
    await db.tale.create({
      data: {
        ...getTaleData(payload),
        categories: payload.categoryIds.length
          ? { create: getCategoryCreateData(payload.categoryIds) }
          : undefined,
      },
    });
  } catch {
    return toSaveErrorState();
  }

  revalidateTalePaths();
  redirect('/admin/tales');
}

export async function updateTaleAction(
  id: string,
  _prevState: TaleFormState,
  formData: FormData,
) {
  let payload: TalePayload;

  try {
    payload = getTalePayload(formData);
  } catch (error) {
    if (error instanceof ZodError) {
      return toValidationErrorState(error);
    }

    return toSaveErrorState();
  }

  try {
    await db.tale.update({
      where: { id },
      data: {
        ...getTaleData(payload),
        categories: {
          deleteMany: {},
          ...(payload.categoryIds.length
            ? { create: getCategoryCreateData(payload.categoryIds) }
            : {}),
        },
      },
    });
  } catch {
    return toSaveErrorState();
  }

  revalidateTalePaths(id);
  redirect('/admin/tales');
}

export async function deleteTaleAction(id: string) {
  try {
    await db.tale.delete({
      where: { id },
    });
  } catch {
    redirect(`/admin/tales/${id}`);
  }

  revalidateTalePaths(id);
  redirect('/admin/tales');
}
