import Image from 'next/image';

const tales = [
  {
    image: '/images/generated-1779051798877.png',
    badgeText: 'Безкоштовно',
    badgeColor: '#7a9071',
    badgeBg: '#7a907118',
    title: 'Ніч без страху',
    desc: 'Казка про хлопчика, який навчився дружити зі своїми страхами',
  },
  {
    image: '/images/generated-1779051824911.png',
    badgeText: 'Платна',
    badgeColor: '#b86549',
    badgeBg: '#b8654918',
    title: 'Сміливий ранок',
    desc: 'Про дівчинку, яка знайшла сміливість прийняти новий день',
  },
  {
    image: '/images/generated-1779051844983.png',
    badgeText: 'Персоналізація',
    badgeColor: '#2f4058',
    badgeBg: '#2f405818',
    title: 'Казка про нового героя',
    desc: 'Історія, де головний герой — ваша дитина',
  },
];

export function FeaturedTales() {
  return (
    <section className="mx-auto max-w-7xl px-8 py-[72px]">
      <div className="mb-10 flex flex-col items-center">
        <h2 className="font-display text-[32px] font-semibold text-app-text">
          Популярні казки
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {tales.map(({ image, badgeText, badgeColor, badgeBg, title, desc }) => (
          <div
            key={title}
            className="overflow-hidden rounded-[20px] border border-[#e8dfd1] bg-app-elevated"
          >
            <div className="relative h-[180px] w-full">
              <Image src={image} alt={title} fill className="object-cover" />
            </div>
            <div className="flex flex-col gap-3 p-6">
              <span
                className="w-fit rounded-pill px-2.5 py-1 text-xs font-semibold"
                style={{ color: badgeColor, backgroundColor: badgeBg }}
              >
                {badgeText}
              </span>
              <h3 className="font-display text-xl font-semibold text-app-text">{title}</h3>
              <p className="text-[14px] leading-[1.5] text-app-secondary">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
