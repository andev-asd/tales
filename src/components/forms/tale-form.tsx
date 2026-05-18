'use client';

import { useActionState, useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Select } from '@/src/components/ui/select';
import { Textarea } from '@/src/components/ui/textarea';
import { slugifyTitle } from '@/src/lib/slugify';
import {
  initialTaleFormState,
  type TaleFormState,
} from '@/src/lib/tale-form-state';
import { PdfUploadField } from './pdf-upload-field';
import { ImageGalleryField } from './image-gallery-field';

type TaleFormCategory = {
  id: string;
  name: string;
};

type TaleFormAction = (state: TaleFormState, formData: FormData) => TaleFormState | Promise<TaleFormState>;

type TaleFormProps = {
  action?: TaleFormAction;
  categories?: TaleFormCategory[];
  submitLabel?: string;
  deleteAction?: (formData: FormData) => void | Promise<void>;
  defaultValues?: {
    title?: string;
    slug?: string;
    shortDescription?: string;
    fullDescription?: string;
    accessType?: 'FREE' | 'PAID' | 'PERSONALIZABLE';
    price?: number | null;
    personalizationPrice?: number | null;
    published?: boolean;
    publishOnHomepage?: boolean;
    homepageOrder?: number | null;
    categoryIds?: string[];
    imagePaths?: string[];
    imagePreviewUrls?: string[];
    pdfPath?: string | null;
    taleId?: string;
  };
};

export function TaleForm({
  action,
  categories = [],
  submitLabel = 'Зберегти',
  deleteAction,
  defaultValues,
}: TaleFormProps) {
  const resolvedAction: TaleFormAction = action ?? (async (currentState: TaleFormState) => currentState);
  const [state, formAction] = useActionState(resolvedAction, initialTaleFormState);
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

  const titleError = state.fieldErrors?.title?.[0];
  const slugError = state.fieldErrors?.slug?.[0];
  const shortDescriptionError = state.fieldErrors?.shortDescription?.[0];
  const fullDescriptionError = state.fieldErrors?.fullDescription?.[0];

  return (
    <div className="space-y-4">
      {state.status === 'error' && state.message ? (
        <p className="rounded-[var(--radius-md)] border border-app-border bg-app-muted px-4 py-3 text-sm text-app-text" role="alert">
          {state.message}
        </p>
      ) : null}
      <div className="rounded-[var(--radius-lg)] border border-app-border bg-app-surface p-8 shadow-soft">
        <form action={formAction} className="grid gap-4">
        <div className="grid gap-2">
          <Input
            name="title"
            placeholder="Назва казки"
            value={title}
            onChange={handleTitleChange}
            aria-invalid={Boolean(titleError)}
            aria-describedby={titleError ? 'tale-title-error' : undefined}
          />
          {titleError ? <p id="tale-title-error" className="text-sm text-app-secondary">{titleError}</p> : null}
        </div>
        <div className="grid gap-2">
          <Input
            name="slug"
            placeholder="Slug"
            value={slug}
            onChange={handleSlugChange}
            aria-invalid={Boolean(slugError)}
            aria-describedby={slugError ? 'tale-slug-error' : undefined}
          />
          {slugError ? <p id="tale-slug-error" className="text-sm text-app-secondary">{slugError}</p> : null}
        </div>
        <div className="grid gap-2">
          <Textarea
            name="shortDescription"
            placeholder="Короткий опис"
            rows={3}
            defaultValue={defaultValues?.shortDescription}
            aria-invalid={Boolean(shortDescriptionError)}
            aria-describedby={shortDescriptionError ? 'tale-short-description-error' : undefined}
          />
          {shortDescriptionError ? (
            <p id="tale-short-description-error" className="text-sm text-app-secondary">{shortDescriptionError}</p>
          ) : null}
        </div>
        <div className="grid gap-2">
          <Textarea
            name="fullDescription"
            placeholder="Повний опис"
            rows={6}
            defaultValue={defaultValues?.fullDescription}
            aria-invalid={Boolean(fullDescriptionError)}
            aria-describedby={fullDescriptionError ? 'tale-full-description-error' : undefined}
          />
          {fullDescriptionError ? (
            <p id="tale-full-description-error" className="text-sm text-app-secondary">{fullDescriptionError}</p>
          ) : null}
        </div>
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
        <Input
          name="homepageOrder"
          type="number"
          placeholder="Порядок на головній"
          defaultValue={defaultValues?.homepageOrder ?? 0}
        />
        <label className="flex items-center gap-3 text-sm text-app-secondary">
          <input name="published" type="checkbox" defaultChecked={defaultValues?.published ?? false} />
          Опубліковано
        </label>
        <label className="flex items-center gap-3 text-sm text-app-secondary">
          <input
            name="publishOnHomepage"
            type="checkbox"
            defaultChecked={defaultValues?.publishOnHomepage ?? false}
          />
          Публікувати на головній
        </label>
        <div className="flex flex-wrap gap-3">
          <Button type="submit">{submitLabel}</Button>
          {deleteAction ? (
            <Button
              type="submit"
              formAction={deleteAction}
              className="bg-transparent text-app-secondary hover:bg-app-muted hover:text-app-text"
            >
              Видалити казку
            </Button>
          ) : null}
        </div>
      </form>

      </div>
    </div>
  );
}
