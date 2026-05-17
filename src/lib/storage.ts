import { createClient } from '@supabase/supabase-js';
import { getEnv } from './env';

export function getStorageAdmin() {
  const env = getEnv();
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
}

export function getImageBucketName() {
  return getEnv().SUPABASE_IMAGE_BUCKET;
}

export function getBooksBucketName() {
  return getEnv().SUPABASE_BOOKS_BUCKET;
}

export function getPublicImageUrl(path: string) {
  return getStorageAdmin().storage.from(getImageBucketName()).getPublicUrl(path).data.publicUrl;
}

export async function createSignedPdfUrl(path: string) {
  const storageAdmin = getStorageAdmin();

  const { data, error } = await storageAdmin.storage
    .from(getBooksBucketName())
    .createSignedUrl(path, 60);

  if (error || !data?.signedUrl) {
    throw new Error('Не вдалося створити захищене посилання на PDF');
  }

  return data.signedUrl;
}
