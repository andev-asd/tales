import Image from 'next/image';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export function Hero() {
  return (
    <section className="mx-auto flex max-w-7xl items-center gap-16 px-8 py-20">
      <div className="flex flex-1 flex-col gap-7">
        <div className="flex w-fit items-center rounded-pill bg-[#b8654915] px-3.5 py-1.5">
          <span className="text-[13px] font-medium text-app-accent">
            Терапевтичні казки українською
          </span>
        </div>

        <h1 className="font-display text-5xl font-semibold leading-[1.15] text-app-text">
          Казки, що допомагають<br />прожити важливе
        </h1>

        <p className="max-w-[480px] text-[17px] leading-[1.65] text-app-secondary">
          Готові та персоналізовані казки для дітей від психологинь. Допоможіть дитині пережити страхи, адаптацію, втрату — через силу терапевтичної історії.
        </p>

        <div className="flex items-center gap-3.5">
          <Link
            href="/catalog"
            className="flex items-center gap-2 rounded-pill bg-app-accent px-7 py-3.5 text-[15px] font-semibold text-white"
          >
            <BookOpen className="h-[18px] w-[18px]" />
            Обрати казку
          </Link>
          <Link
            href="/custom-story"
            className="rounded-pill bg-[#241b1410] px-7 py-3.5 text-[15px] font-medium text-app-text ring-1 ring-[#241b1420]"
          >
            Замовити індивідуальну
          </Link>
        </div>
      </div>

      <div className="relative h-[440px] w-[520px] shrink-0 overflow-hidden rounded-[28px]">
        <Image
          src="/images/generated-1779051642744.png"
          alt="Ілюстрація до казки"
          fill
          className="object-cover"
          priority
        />
      </div>
    </section>
  );
}
