import { CatalogFilters } from '@/src/components/catalog/catalog-filters';
import { TaleCard } from '@/src/components/catalog/tale-card';
import { getCatalogTales } from '@/src/server/queries/catalog';

type CatalogTale = Awaited<ReturnType<typeof getCatalogTales>>[number];

export const dynamic = 'force-dynamic';

export default async function CatalogPage() {
  const tales = await getCatalogTales();
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
      <div className="space-y-6">
        <h1 className="font-display text-5xl text-app-text">Каталог казок</h1>
        <p className="max-w-3xl text-lg leading-8 text-app-secondary">
          Оберіть історію за ситуацією та форматом: безкоштовну, платну або з
          можливістю персоналізації.
        </p>
        <CatalogFilters />
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {tales.map((tale: CatalogTale) => (
          <TaleCard key={tale.slug} tale={tale} />
        ))}
      </div>
    </section>
  );
}
