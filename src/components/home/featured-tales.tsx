import Image from 'next/image';
import { cn } from '@/src/lib/utils';

const tales = [
  {
    badge: 'Безкоштовно',
    badgeClassName: 'bg-[rgba(122,144,113,0.1)] text-app-accentSecondary',
    title: 'Ніч без страху',
    description: 'Казка про хлопчика, який навчився дружити зі своїми страхами',
    image: '/images/generated-1779051798877.png',
  },
  {
    badge: 'Платна',
    badgeClassName: 'bg-[rgba(184,101,73,0.1)] text-app-accent',
    title: 'Сміливий ранок',
    description: 'Про дівчинку, яка знайшла сміливість прийняти новий день',
    image: '/images/generated-1779051824911.png',
  },
  {
    badge: 'Персоналізація',
    badgeClassName: 'bg-[rgba(47,64,88,0.1)] text-app-premium',
    title: 'Казка про нового героя',
    description: 'Історія, де головний герой — ваша дитина',
    image: '/images/generated-1779051844983.png',
  },
] as const;

export function FeaturedTales() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-[72px] md:px-8">
      <div className="flex flex-col items-center gap-10 text-center">
        <h2 className="font-display text-[32px] font-semibold text-app-text">
          Популярні казки
        </h2>

        <div className="grid w-full gap-6 lg:grid-cols-3">
          {tales.map((tale) => (
            <article
              key={tale.title}
              className="overflow-hidden rounded-[20px] border border-[#e8dfd1] bg-white text-left"
            >
              <div className="relative h-[180px]">
                <Image src={tale.image} alt={tale.title} fill className="object-cover" sizes="33vw" />
              </div>
              <div className="space-y-3 p-6">
                <span
                  className={cn(
                    'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold',
                    tale.badgeClassName,
                  )}
                >
                  {tale.badge}
                </span>
                <h3 className="font-display text-2xl font-semibold text-app-text">{tale.title}</h3>
                <p className="text-sm leading-6 text-app-muted">{tale.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
