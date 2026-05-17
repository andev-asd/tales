import { Badge } from '@/src/components/ui/badge';
import { Card } from '@/src/components/ui/card';

export function FeaturedTales() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <div className="space-y-5">
        <h2 className="font-display text-4xl text-app-text md:text-5xl">
          Безкоштовні та популярні казки
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            ['Безкоштовна', 'Ніч без страху'],
            ['Платна', 'Сміливий ранок'],
            ['Персоналізація', 'Казка про нового героя'],
          ].map(([label, title]) => (
            <Card key={title}>
              <Badge>{label}</Badge>
              <h3 className="mt-4 font-display text-2xl text-app-text">{title}</h3>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
