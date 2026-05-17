import type { LibrarySource } from '@/src/lib/user-types';

export function buildCollectionNotice(source: LibrarySource) {
  return source === 'FREE_ADDED'
    ? 'Книгу додано в колекцію'
    : 'Книгу додано в колекцію як придбану';
}

export function createDownloadResponse(tokenId: string) {
  return {
    tokenId,
    expiresInSeconds: 60,
  };
}
