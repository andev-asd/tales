import { CatalogFilters } from '@/src/components/catalog/catalog-filters';
import { TaleCard } from '@/src/components/catalog/tale-card';
import { getCatalogTales } from '@/src/server/queries/catalog';

type CatalogTale = Awaited<ReturnType<typeof getCatalogTales>>[number];

export const dynamic = 'force-dynamic';

export default async function CatalogPage() {
  const tales = await getCatalogTales();
  return (
    <section className="bg-app-bg">
      <div className="mx-auto max-w-7xl px-4 pb-20 md:px-20">
        <div className="flex flex-col items-center gap-3 pt-12 pb-8">
          <h1 className="text-center font-display text-4xl font-semibold text-app-text">
            Каталог казок
          </h1>
          <p className="max-w-3xl text-center text-base text-app-secondary">
            Оберіть казку для вашої дитини за ситуацією
          </p>
        </div>
        <CatalogFilters />
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {tales.map((tale: CatalogTale) => (
            <TaleCard key={tale.slug} tale={tale} />
          ))}
        </div>
      </div>
    </section>
  );
}
