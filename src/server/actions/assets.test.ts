import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildBookAssetPath, buildImageAssetPath, getAssetPayload, validateAssetFile } from './assets';

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
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-05-16T12:00:00Z'));
  vi.stubGlobal('process', {
    ...process,
    env,
  });
  vi.stubGlobal('File', class {
    name: string;
    type: string;
    constructor(...args: [never[]?, string?, { type?: string }?]) {
      const [, name = 'mock.png', options = {}] = args;
      this.name = name;
      this.type = options.type ?? 'image/png';
    }
    arrayBuffer() {
      return Promise.resolve(new ArrayBuffer(8));
    }
  } as never);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

async function loadAssetsModule() {
  vi.resetModules();
  const storageMocks = {
    from: vi.fn(),
  };
  const createClient = vi.fn().mockReturnValue({ storage: storageMocks });
  vi.doMock('@supabase/supabase-js', () => ({ createClient }));
  const mod = await import('./assets');
  return { ...mod, storageMocks };
}

describe('asset path helpers', () => {
  it('builds bucket-prefixed image and book paths', () => {
    expect(buildImageAssetPath('cover.png')).toBe('images/1778932800000-cover.png');
    expect(buildBookAssetPath('story.pdf')).toBe('books/1778932800000-story.pdf');
  });
});

describe('validateAssetFile', () => {
  it('accepts images and pdfs and rejects invalid types', () => {
    expect(() => validateAssetFile(new File([], 'cover.png', { type: 'image/png' }), 'image')).not.toThrow();
    expect(() => validateAssetFile(new File([], 'story.pdf', { type: 'application/pdf' }), 'book')).not.toThrow();
    expect(() => validateAssetFile(new File([], 'cover.txt', { type: 'text/plain' }), 'image')).toThrow('Потрібно завантажити зображення');
    expect(() => validateAssetFile(new File([], 'story.txt', { type: 'text/plain' }), 'book')).toThrow('Потрібно завантажити PDF');
  });
});

describe('getAssetPayload', () => {
  it('returns file bytes for upload', async () => {
    const payload = await getAssetPayload(new File([], 'cover.png', { type: 'image/png' }));
    expect(payload).toBeInstanceOf(ArrayBuffer);
  });
});

describe('uploadAsset', () => {
  it('uploads to the matching bucket and returns the public url for images', async () => {
    const { uploadAsset: upload, storageMocks } = await loadAssetsModule();
    const bucketClient = {
      upload: vi.fn().mockResolvedValue({ error: null }),
      getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://public.example.com/cover.png' } }),
    };
    storageMocks.from.mockReturnValue(bucketClient);

    const result = await upload(new File([], 'cover.png', { type: 'image/png' }), 'image');

    expect(storageMocks.from).toHaveBeenCalledWith('images');
    expect(bucketClient.upload).toHaveBeenCalledWith('images/1778932800000-cover.png', expect.any(ArrayBuffer), {
      contentType: 'image/png',
      upsert: true,
    });
    expect(result).toEqual({
      bucket: 'images',
      path: 'images/1778932800000-cover.png',
      displayUrl: 'https://public.example.com/cover.png',
      fileName: 'cover.png',
    });
  });
});

describe('deleteAsset', () => {
  it('removes the file from the provided bucket', async () => {
    const { deleteAsset: removeAsset, storageMocks } = await loadAssetsModule();
    const remove = vi.fn().mockResolvedValue({ error: null });
    storageMocks.from.mockReturnValue({ remove });

    await removeAsset('images', 'images/abc.png');

    expect(storageMocks.from).toHaveBeenCalledWith('images');
    expect(remove).toHaveBeenCalledWith(['images/abc.png']);
  });
});

describe('replaceAsset', () => {
  it('deletes the old file before uploading the new file', async () => {
    const { replaceAsset: replace, storageMocks } = await loadAssetsModule();
    const remove = vi.fn().mockResolvedValue({ error: null });
    const upload = vi.fn().mockResolvedValue({ error: null });
    const getPublicUrl = vi.fn().mockReturnValue({ data: { publicUrl: 'https://public.example.com/new.png' } });
    storageMocks.from.mockImplementation(() => ({ remove, upload, getPublicUrl }));

    const result = await replace(new File([], 'new.png', { type: 'image/png' }), 'image', {
      bucket: 'images',
      path: 'images/old.png',
    });

    expect(remove).toHaveBeenCalledBefore(upload);
    expect(remove).toHaveBeenCalledWith(['images/old.png']);
    expect(upload).toHaveBeenCalledWith('images/1778932800000-new.png', expect.any(ArrayBuffer), {
      contentType: 'image/png',
      upsert: true,
    });
    expect(result.path).toBe('images/1778932800000-new.png');
  });
});
