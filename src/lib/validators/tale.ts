import { z } from 'zod';

export const taleSchema = z.object({
  title: z.string().min(2),
  slug: z.string().min(2),
  shortDescription: z.string().min(10),
  fullDescription: z.string().min(20),
  accessType: z.enum(['FREE', 'PAID', 'PERSONALIZABLE']),
  price: z.number().int().nonnegative().nullable().optional(),
  personalizationPrice: z.number().int().nonnegative().nullable().optional(),
  published: z.boolean().default(false),
  publishOnHomepage: z.boolean().default(false),
  homepageOrder: z.number().int().nonnegative().default(0),
  categoryIds: z.array(z.string()).default([]),
  galleryPaths: z.array(z.string()).default([]),
  pdfPath: z.string().nullable().optional(),
});
