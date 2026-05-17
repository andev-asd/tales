import { taleSchema } from '@/src/lib/validators/tale';

export function formatPriceLabel(value: number | null) {
  return value === null ? 'Без ціни' : `${value} грн`;
}

export function normalizeTalePrice(value: string) {
  const trimmed = value.trim();
  return trimmed === '' ? null : Number(trimmed);
}

export function normalizeTaleInput(input: {
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  accessType: 'FREE' | 'PAID' | 'PERSONALIZABLE';
  price: string;
  personalizationPrice: string;
  published: boolean;
  categoryIds: string[];
  galleryPaths?: string[];
  pdfPath?: string | null;
}) {
  return taleSchema.parse({
    title: input.title.trim(),
    slug: input.slug.trim().toLowerCase(),
    shortDescription: input.shortDescription.trim(),
    fullDescription: input.fullDescription.trim(),
    accessType: input.accessType,
    price: normalizeTalePrice(input.price),
    personalizationPrice: normalizeTalePrice(input.personalizationPrice),
    published: input.published,
    categoryIds: input.categoryIds,
    galleryPaths: (input.galleryPaths ?? []).map((path) => path.trim()).filter(Boolean),
    pdfPath: input.pdfPath?.trim() ? input.pdfPath.trim() : null,
  });
}
