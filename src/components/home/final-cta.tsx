import Link from 'next/link';

export function FinalCta() {
  return (
    <section className="bg-app-premium">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-20 text-center md:px-8">
        <h2 className="font-display text-4xl font-semibold text-white md:text-[36px]">
          Готові обрати казку для вашої дитини?
        </h2>
        <p className="text-base text-white/80">
          Перегляньте каталог терапевтичних казок або замовте індивідуальну історію
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/catalog"
            className="rounded-full bg-app-accent px-8 py-[14px] text-[15px] font-semibold text-white transition-colors hover:bg-[#a95b41]"
          >
            Переглянути каталог
          </Link>
          <Link
            href="/custom-story"
            className="rounded-full border border-white/25 bg-white/10 px-8 py-[14px] text-[15px] font-medium text-white transition-colors hover:bg-white/15"
          >
            Замовити індивідуальну
          </Link>
        </div>
      </div>
    </section>
  );
}
