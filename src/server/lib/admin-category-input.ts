import { categorySchema } from '@/src/lib/validators/category';

export function normalizeCategoryInput(input: { name: string; slug: string }) {
  return categorySchema.parse({
    name: input.name.trim(),
    slug: input.slug.trim().toLowerCase(),
  });
}
