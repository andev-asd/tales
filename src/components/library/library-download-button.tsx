'use client';

import { useState } from 'react';

type LibraryDownloadButtonProps = {
  libraryItemId: string;
};

export function LibraryDownloadButton({ libraryItemId }: LibraryDownloadButtonProps) {
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="mt-4 grid gap-2">
      <button
        type="button"
        disabled={isLoading}
        className="text-left text-sm font-medium text-app-accent disabled:opacity-60"
        onClick={async () => {
          setIsLoading(true);
          setStatus('Готуємо завантаження...');

          try {
            const response = await fetch(`/api/download/${libraryItemId}`);
            const data = await response.json().catch(() => null);

            if (!response.ok || !(data as { signedUrl?: string } | null)?.signedUrl) {
              setStatus((data as { error?: string } | null)?.error ?? 'Не вдалося підготувати файл');
              return;
            }

            window.open((data as { signedUrl: string }).signedUrl, '_blank', 'noopener,noreferrer');
            setStatus('Завантаження готове');
          } catch {
            setStatus('Не вдалося підготувати файл');
          } finally {
            setIsLoading(false);
          }
        }}
      >
        {isLoading ? 'Готуємо файл...' : 'Завантажити доступну казку'}
      </button>
      {status ? <p className="text-sm text-app-secondary">{status}</p> : null}
    </div>
  );
}
