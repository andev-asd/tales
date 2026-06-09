import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildCollectionNotice, createDownloadResponse } from './library';

const env = {
  DATABASE_URL: 'postgres://localhost/test',
  BETTER_AUTH_SECRET: 'secret',
  BETTER_AUTH_URL: 'https://example.com',
  GOOGLE_CLIENT_ID: 'google-client-id',
  GOOGLE_CLIENT_SECRET: 'google-client-secret',
  SUPABASE_URL: 'https://supabase.example.com',
  SUPABASE_ANON_KEY: 'anon',
  SUPABASE_SERVICE_ROLE_KEY: 'service-role',
  SUPABASE_IMAGE_BUCKET: 'images',
  SUPABASE_BOOKS_BUCKET: 'files',
  NOVA_POSHTA_API_KEY: 'nova-poshta-test-key',
};

beforeEach(() => {
  vi.stubGlobal('process', {
    ...process,
    env,
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('buildCollectionNotice', () => {
  it('returns different Ukrainian notices for free and purchased tales', () => {
    expect(buildCollectionNotice('FREE_ADDED')).toBe('Книгу додано в колекцію');
    expect(buildCollectionNotice('PURCHASED')).toBe(
      'Книгу додано в колекцію як придбану',
    );
  });
});

describe('createDownloadResponse', () => {
  it('returns a signed URL from the books bucket', async () => {
    const storage = {
      from: vi.fn().mockReturnValue({
        createSignedUrl: vi.fn().mockResolvedValue({
          data: { signedUrl: 'https://signed.example.com' },
          error: null,
        }),
      }),
    };
    const createClient = vi.fn().mockReturnValue({ storage });
    vi.doMock('@supabase/supabase-js', () => ({ createClient }));

    const { createSignedPdfUrl } = await import('@/src/lib/storage');

    await expect(createSignedPdfUrl('pdf/abc123.pdf')).resolves.toBe(
      'https://signed.example.com',
    );
    expect(storage.from).toHaveBeenCalledWith('files');
  });

  it('returns a short-lived access policy description', () => {
    expect(createDownloadResponse('abc123')).toEqual({
      tokenId: 'abc123',
      expiresInSeconds: 60,
    });
  });
});
