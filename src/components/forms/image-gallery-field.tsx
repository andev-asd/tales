'use client';

import { useRef, useState, type DragEvent } from 'react';

type ImageGalleryFieldProps = {
  name: string;
  taleId?: string;
  defaultPaths?: string[];
  defaultPreviewUrls?: string[];
};

type GalleryItem = {
  path: string;
  previewUrl: string;
};

function isImageFile(file: File) {
  return file.type.startsWith('image/') || /\.(avif|bmp|gif|heic|heif|jpe?g|png|svg|webp)$/i.test(file.name);
}

export function ImageGalleryField({ name, taleId, defaultPaths = [], defaultPreviewUrls = [] }: ImageGalleryFieldProps) {
  const [items, setItems] = useState<GalleryItem[]>(() =>
    defaultPaths.map((path, index) => ({
      path,
      previewUrl: defaultPreviewUrls[index] ?? '',
    })),
  );
  const [status, setStatus] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const dragDepthRef = useRef(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const uploadFiles = async (files: FileList | File[] | null) => {
    const nextFiles = Array.from(files ?? []).filter(isImageFile);
    if (nextFiles.length === 0) {
      setStatus('Не вдалося знайти файли зображень');
      return;
    }

    setStatus(`Завантаження: ${nextFiles.map((file) => file.name).join(', ')}`);
    const uploadedItems: GalleryItem[] = [];

    try {
      for (const file of nextFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('kind', 'image');
        formData.append('action', 'upload');
        if (taleId) {
          formData.append('taleId', taleId);
        }

        const response = await fetch('/api/admin/assets', { method: 'POST', body: formData });
        const data = await response.json().catch(() => null);

        if (!response.ok) {
          setStatus((data as { error?: string } | null)?.error ?? `Помилка завантаження: ${file.name}`);
          return;
        }

        uploadedItems.push({
          path: (data as { path: string }).path,
          previewUrl: (data as { displayUrl?: string } | null)?.displayUrl ?? '',
        });
      }

      setItems((current) => [...current, ...uploadedItems]);
      setStatus(`Додано: ${uploadedItems.map((item) => item.path.split('/').pop() ?? item.path).join(', ')}`);
      if (inputRef.current) inputRef.current.value = '';
    } catch {
      setStatus('Не вдалося завантажити зображення');
    }
  };

  const handleDelete = async (path: string) => {
    const formData = new FormData();
    formData.append('kind', 'image');
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

    setItems((current) => current.filter((item) => item.path !== path));
    setStatus('Зображення видалено');
  };

  const moveItem = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= items.length) return;

    setItems((current) => {
      const next = [...current];
      const [item] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, item);
      return next;
    });
  };

  const handleFileDrop = async (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    dragDepthRef.current = 0;
    setIsDraggingFiles(false);
    const droppedFiles = Array.from(event.dataTransfer.files ?? []);
    if (droppedFiles.length === 0) {
      setStatus('Файли не передані');
      return;
    }
    await uploadFiles(droppedFiles);
  };

  const handleFileDragEnter = (event: DragEvent<HTMLElement>) => {
    if (!Array.from(event.dataTransfer.types).includes('Files')) return;
    event.preventDefault();
    event.stopPropagation();
    dragDepthRef.current += 1;
    setIsDraggingFiles(true);
  };

  const handleFileDragOver = (event: DragEvent<HTMLElement>) => {
    if (!Array.from(event.dataTransfer.types).includes('Files')) return;
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'copy';
    setIsDraggingFiles(true);
  };

  const handleFileDragLeave = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
    if (dragDepthRef.current === 0) {
      setIsDraggingFiles(false);
    }
  };

  return (
    <div className="grid gap-3 rounded-[var(--radius-lg)] border border-app-border p-4">
      {items.map((item) => (
        <input key={item.path} type="hidden" name={name} value={item.path} />
      ))}
      <div className="flex items-center justify-between gap-4">
        <div>
          <label className="text-sm text-app-secondary">Зображення казки</label>
          <p className="text-xs text-app-secondary">Перше зображення буде обкладинкою. Інші стануть галереєю сторінок.</p>
        </div>
        <span className="text-sm text-app-secondary">{items.length} зображень</span>
      </div>
      {items.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <div
              key={item.path}
              draggable
              onDragStart={() => setDraggedIndex(index)}
              onDragEnd={() => setDraggedIndex(null)}
              onDragOver={(event) => {
                if (Array.from(event.dataTransfer.types).includes('Files')) {
                  void handleFileDragOver(event);
                  return;
                }
                event.preventDefault();
              }}
              onDrop={(event) => {
                if (Array.from(event.dataTransfer.types).includes('Files')) {
                  void handleFileDrop(event);
                  return;
                }
                event.preventDefault();
                if (draggedIndex === null) return;
                moveItem(draggedIndex, index);
                setDraggedIndex(null);
              }}
              className="grid gap-2 rounded-[var(--radius-md)] border border-app-border p-2"
            >
              {item.previewUrl ? (
                <img
                  src={item.previewUrl}
                  alt={`Зображення ${index + 1}`}
                  className="h-40 w-full rounded-md object-cover"
                  onError={() => {
                    setItems((current) => current.map((currentItem) => (
                      currentItem.path === item.path ? { ...currentItem, previewUrl: '' } : currentItem
                    )));
                  }}
                />
              ) : (
                <div className="flex h-40 w-full items-center justify-center rounded-md bg-app-elevated text-sm text-app-secondary">
                  Немає превʼю
                </div>
              )}
              <div className="flex items-center justify-between gap-2 text-xs text-app-secondary">
                <span>{index === 0 ? 'Обкладинка' : `Сторінка ${index}`}</span>
                <div className="flex gap-2">
                  <button type="button" onClick={() => moveItem(index, index - 1)} className="rounded border border-app-border px-2 py-1" disabled={index === 0}>
                    ↑
                  </button>
                  <button type="button" onClick={() => moveItem(index, index + 1)} className="rounded border border-app-border px-2 py-1" disabled={index === items.length - 1}>
                    ↓
                  </button>
                </div>
              </div>
              <button type="button" onClick={() => void handleDelete(item.path)} className="text-sm font-medium text-red-700">
                Видалити
              </button>
            </div>
          ))}
        </div>
      ) : null}
      <div className="relative min-h-[120px] rounded-[var(--radius-lg)]">
        <div
          onClick={() => inputRef.current?.click()}
          className={`flex min-h-[120px] cursor-pointer items-center justify-center rounded-[var(--radius-lg)] border border-dashed px-4 py-6 text-center text-sm ${isDraggingFiles ? 'border-app-accent bg-app-surface text-app-text' : 'border-app-border bg-app-elevated text-app-secondary'}`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(event) => void uploadFiles(event.target.files)}
          />
          <span className="pointer-events-none">{isDraggingFiles ? 'Відпустіть файли для завантаження' : 'Перетягніть зображення сюди або натисніть для вибору'}</span>
        </div>
        <div
          onDragEnter={handleFileDragEnter}
          onDragOver={handleFileDragOver}
          onDragLeave={handleFileDragLeave}
          onDrop={(event) => void handleFileDrop(event)}
          className="absolute inset-0 z-10"
        />
      </div>
      {status ? <p className="text-sm text-app-secondary">{status}</p> : null}
    </div>
  );
}
