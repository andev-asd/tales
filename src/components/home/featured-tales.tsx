import { TaleCard } from '@/src/components/catalog/tale-card';
import { getFeaturedHomepageTales } from '@/src/server/queries/public';

export async function FeaturedTales() {
  const tales = await getFeaturedHomepageTales();

  if (tales.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-8 py-[72px]">
      <div className="mb-10 flex flex-col items-center">
        <h2 className="font-display text-[32px] font-semibold text-app-text">
          Популярні казки
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {tales.map((tale) => (
          <TaleCard key={tale.id} tale={tale} />
        ))}
      </div>
    </section>
  );
}
