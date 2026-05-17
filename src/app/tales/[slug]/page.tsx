import { notFound } from 'next/navigation';
import { TaleActions } from '@/src/components/tales/tale-actions';
import { TaleGallery } from '@/src/components/tales/tale-gallery';
import { Badge } from '@/src/components/ui/badge';
import { getCatalogTaleBySlug } from '@/src/server/queries/catalog';

export const dynamic = 'force-dynamic';

export default async function TalePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tale = await getCatalogTaleBySlug(slug);

  if (!tale) {
    notFound();
  }

  const label =
    tale.accessType === 'FREE'
      ? 'Безкоштовна'
      : tale.accessType === 'PAID'
        ? 'Платна'
        : 'Персоналізація';

  const galleryUrls = [
    ...(tale.coverUrl ? [tale.coverUrl] : []),
    ...tale.galleryUrls,
  ].filter((url, index, array) => array.indexOf(url) === index);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)] lg:items-start">
        <div className="space-y-4">
          <TaleGallery title={tale.title} imageUrls={galleryUrls} />
        </div>
        <div className="lg:sticky lg:top-24">
          <Badge>{label}</Badge>
          <h1 className="mt-5 font-display text-5xl text-app-text">{tale.title}</h1>
          <p className="mt-6 text-lg leading-8 text-app-secondary">{tale.fullDescription}</p>
          <TaleActions tale={tale} />
        </div>
      </div>
    </section>
  );
}
