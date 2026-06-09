import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(1),
  BETTER_AUTH_URL: z.url(),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  SUPABASE_URL: z.url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_IMAGE_BUCKET: z.string().min(1),
  SUPABASE_BOOKS_BUCKET: z.string().min(1),
  NOVA_POSHTA_API_KEY: z.string().min(1),
});

export function getEnv() {
  return envSchema.parse(process.env);
}
