import Link from 'next/link';

export function FinalCta() {
  return (
    <section
      className="flex flex-col items-center gap-6 px-[120px] py-20 text-center"
      style={{ backgroundColor: '#2f4058' }}
    >
      <h2 className="font-display text-[36px] font-semibold text-white">
        Готові обрати казку для вашої дитини?
      </h2>
      <p className="text-base" style={{ color: '#ffffffcc' }}>
        Перегляньте каталог терапевтичних казок або замовте індивідуальну історію
      </p>
      <div className="flex items-center gap-4">
        <Link
          href="/catalog"
          className="rounded-pill bg-app-accent px-8 py-3.5 text-[15px] font-semibold text-white"
        >
          Переглянути каталог
        </Link>
        <Link
          href="/custom-story"
          className="rounded-pill px-8 py-3.5 text-[15px] font-medium text-white ring-1 ring-white/25"
          style={{ backgroundColor: '#ffffff20' }}
        >
          Замовити індивідуальну
        </Link>
      </div>
    </section>
  );
}
