import { Editor } from '@/src/features/editor/Editor';
import { createDocument, createDocumentFromImages } from '@/src/features/editor/document';
import { getCatalogTaleBySlug } from '@/src/server/queries/catalog';

export const dynamic = 'force-dynamic';

export default async function EditorPage({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string }>;
}) {
  const { slug } = await searchParams;

  let initialDocument = createDocument();

  if (slug) {
    const tale = await getCatalogTaleBySlug(slug);

    if (tale) {
      const imageUrls = [
        ...(tale.coverUrl ? [tale.coverUrl] : []),
        ...tale.galleryUrls,
      ];
      initialDocument = createDocumentFromImages(imageUrls);
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <div className="space-y-4">
        <h1 className="font-display text-4xl text-app-text">Конструктор казки</h1>
        <p className="text-app-secondary">
          Персоналізуйте казку перед замовленням — додавайте текст та зображення.
        </p>
      </div>
      <div className="mt-6 overflow-hidden rounded-[var(--radius-lg)] border border-app-border bg-app-surface shadow-soft">
        <Editor initialDocument={initialDocument} className="min-h-[720px]" />
      </div>
    </section>
  );
}
