'use client';

import { useRef, useState } from 'react';

type PdfUploadFieldProps = {
  name: string;
  taleId?: string;
  defaultPath?: string | null;
};

export function PdfUploadField({ name, taleId, defaultPath }: PdfUploadFieldProps) {
  const [path, setPath] = useState(defaultPath ?? '');
  const [fileName, setFileName] = useState(defaultPath ? defaultPath.split('/').pop() ?? defaultPath : '');
  const [status, setStatus] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  const sendFile = async (file: File, action: 'upload' | 'replace') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('kind', 'book');
    formData.append('action', action);

    if (path) {
      formData.append('existingPath', path);
    }

    if (taleId) {
      formData.append('taleId', taleId);
    }
    setStatus('Завантаження...');
    const response = await fetch('/api/admin/assets', { method: 'POST', body: formData });
    const data = await response.json();
    if (!response.ok) {
      setStatus(data.error ?? 'Помилка завантаження');
      return;
    }
    setPath(data.path);
    setFileName(data.fileName ?? 'PDF');
    setStatus('PDF завантажено');
  };

  const handleFiles = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    await sendFile(file, path ? 'replace' : 'upload');
  };

  const handleDelete = async () => {
    if (!path) return;
    const formData = new FormData();
    formData.append('kind', 'book');
    formData.append('action', 'delete');
    formData.append('existingPath', path);
    if (taleId) {
      formData.append('taleId', taleId);
    }
    setStatus('Видалення...');
    const response = await fetch('/api/admin/assets', { method: 'POST', body: formData });
    if (!response.ok) {
      const data = await response.json();
      setStatus(data.error ?? 'Не вдалося видалити файл');
      return;
    }
    setPath('');
    setFileName('');
    setStatus('PDF видалено');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="grid gap-3 rounded-[var(--radius-lg)] border border-app-border p-4">
      <input type="hidden" name={name} value={path} />
      <div className="flex items-center justify-between gap-4">
        <label className="text-sm text-app-secondary">PDF книги</label>
        {path ? (
          <button type="button" onClick={handleDelete} className="text-sm font-medium text-red-700">
            Видалити
          </button>
        ) : null}
      </div>
      {fileName ? <p className="text-sm text-app-secondary">Поточний файл: {fileName}</p> : null}
      <label
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          void handleFiles(event.dataTransfer.files);
        }}
        className="flex min-h-[120px] cursor-pointer items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-app-border bg-app-elevated px-4 py-6 text-center text-sm text-app-secondary"
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(event) => void handleFiles(event.target.files)}
        />
        <span>{path ? 'Перетягніть новий PDF або натисніть для заміни' : 'Перетягніть PDF сюди або натисніть для вибору'}</span>
      </label>
      {status ? <p className="text-sm text-app-secondary">{status}</p> : null}
    </div>
  );
}
