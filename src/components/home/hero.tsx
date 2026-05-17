import Link from 'next/link';
import { Button } from '@/src/components/ui/button';
import { Card } from '@/src/components/ui/card';

export function Hero() {
  return (
    <section className="mx-auto grid max-w-7xl gap-10 px-4 py-20 md:grid-cols-2 md:px-8 md:py-24">
      <div className="space-y-6">
        <p className="text-sm uppercase tracking-[0.24em] text-app-secondary">
          Терапевтичні казки українською
        </p>
        <h1 className="font-display text-5xl leading-tight text-app-text md:text-7xl">
          Казки, що допомагають прожити важливе.
        </h1>
        <p className="max-w-xl text-lg leading-8 text-app-secondary">
          Платформа для батьків, які шукають готові терапевтичні історії або
          індивідуальну казку з психологом для конкретної ситуації дитини.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link href="/catalog">
            <Button>Обрати готову казку</Button>
          </Link>
          <Link href="/custom-story">
            <Button className="bg-transparent text-app-text ring-1 ring-app-border hover:bg-app-surface hover:text-app-text">
              Замовити індивідуальну
            </Button>
          </Link>
        </div>
      </div>

      <Card className="grid gap-4 bg-[linear-gradient(180deg,#fffaf4_0%,#eef2e8_100%)]">
        <div className="rounded-[var(--radius-md)] bg-app-elevated p-5 text-app-text shadow-soft">
          Готові казки для типових ситуацій: страхи, сон, адаптація, тривожність.
        </div>
        <div className="rounded-[var(--radius-md)] bg-app-premium p-5 text-white shadow-soft">
          Індивідуальна робота з психологом для складніших історій, втрат і глибших запитів.
        </div>
      </Card>
    </section>
  );
}
