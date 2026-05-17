'use client';

import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Select } from '@/src/components/ui/select';
import { Textarea } from '@/src/components/ui/textarea';
import { slugifyTitle } from '@/src/lib/slugify';
import { PdfUploadField } from './pdf-upload-field';
import { ImageGalleryField } from './image-gallery-field';

type TaleFormCategory = {
  id: string;
  name: string;
};

type TaleFormProps = {
  action?: (formData: FormData) => void | Promise<void>;
  categories?: TaleFormCategory[];
  defaultValues?: {
    title?: string;
    slug?: string;
    shortDescription?: string;
    fullDescription?: string;
    accessType?: 'FREE' | 'PAID' | 'PERSONALIZABLE';
    price?: number | null;
    personalizationPrice?: number | null;
    published?: boolean;
    categoryIds?: string[];
    imagePaths?: string[];
    imagePreviewUrls?: string[];
    pdfPath?: string | null;
    taleId?: string;
  };
};

export function TaleForm({ action, categories = [], defaultValues }: TaleFormProps) {
  const [title, setTitle] = useState(defaultValues?.title ?? '');
  const [slug, setSlug] = useState(defaultValues?.slug ?? '');
  const slugTouchedRef = useRef(Boolean(defaultValues?.slug));

  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextTitle = event.target.value;
    setTitle(nextTitle);

    if (!slugTouchedRef.current) {
      setSlug(slugifyTitle(nextTitle));
    }
  };

  const handleSlugChange = (event: ChangeEvent<HTMLInputElement>) => {
    slugTouchedRef.current = true;
    setSlug(event.target.value);
  };

  useEffect(() => {
    if (!defaultValues?.slug) {
      setSlug(slugifyTitle(defaultValues?.title ?? ''));
    }
  }, [defaultValues?.slug, defaultValues?.title]);

  return (
    <form action={action} className="grid gap-4 rounded-[var(--radius-lg)] border border-app-border bg-app-surface p-8 shadow-soft">
      <Input
        name="title"
        placeholder="Назва казки"
        value={title}
        onChange={handleTitleChange}
      />
      <Input
        name="slug"
        placeholder="Slug"
        value={slug}
        onChange={handleSlugChange}
      />
      <Textarea
        name="shortDescription"
        placeholder="Короткий опис"
        rows={3}
        defaultValue={defaultValues?.shortDescription}
      />
      <Textarea
        name="fullDescription"
        placeholder="Повний опис"
        rows={6}
        defaultValue={defaultValues?.fullDescription}
      />
      <Select name="accessType" defaultValue={defaultValues?.accessType ?? 'FREE'}>
        <option value="FREE">Безкоштовна</option>
        <option value="PAID">Платна</option>
        <option value="PERSONALIZABLE">Персоналізація</option>
      </Select>
      <Input
        name="price"
        type="number"
        min="0"
        placeholder="Ціна"
        defaultValue={defaultValues?.price ?? ''}
      />
      <Input
        name="personalizationPrice"
        type="number"
        min="0"
        placeholder="Ціна персоналізації"
        defaultValue={defaultValues?.personalizationPrice ?? ''}
      />
      <ImageGalleryField
        name="imagePaths"
        taleId={defaultValues?.taleId}
        defaultPaths={defaultValues?.imagePaths ?? []}
        defaultPreviewUrls={defaultValues?.imagePreviewUrls ?? []}
      />
      <PdfUploadField name="pdfPath" taleId={defaultValues?.taleId} defaultPath={defaultValues?.pdfPath ?? ''} />
      {categories.length > 0 ? (
        <fieldset className="grid gap-3 rounded-[var(--radius-lg)] border border-app-border p-4">
          <legend className="px-2 text-sm text-app-secondary">Категорії</legend>
          {categories.map((category) => (
            <label key={category.id} className="flex items-center gap-3 text-sm text-app-secondary">
              <input
                type="checkbox"
                name="categoryIds"
                value={category.id}
                defaultChecked={defaultValues?.categoryIds?.includes(category.id) ?? false}
              />
              {category.name}
            </label>
          ))}
        </fieldset>
      ) : null}
      <label className="flex items-center gap-3 text-sm text-app-secondary">
        <input name="published" type="checkbox" defaultChecked={defaultValues?.published ?? false} />
        Опубліковано
      </label>
      <Button type="submit">Зберегти</Button>
    </form>
  );
}
