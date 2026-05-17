import { Card } from '@/src/components/ui/card';

export function ProductPaths() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h3 className="font-display text-3xl text-app-text">Готові казки</h3>
          <p className="mt-4 text-app-secondary">
            Безкоштовні, платні та персоналізовані шаблонні історії з м’яким
            терапевтичним ефектом.
          </p>
        </Card>
        <Card>
          <h3 className="font-display text-3xl text-app-text">Індивідуальна казка</h3>
          <p className="mt-4 text-app-secondary">
            Бриф, переписка та підготовка персональної казки разом із психологом.
          </p>
        </Card>
      </div>
    </section>
  );
}
