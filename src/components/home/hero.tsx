import Image from 'next/image';
import Link from 'next/link';
import { BookOpen, Sparkles } from 'lucide-react';
import { Button } from '@/src/components/ui/button';

export function Hero() {
  return (
    <section className="mx-auto flex max-w-7xl flex-col gap-12 px-4 py-12 md:px-8 md:py-20 lg:flex-row lg:items-center lg:gap-[60px]">
      <div className="flex-1 space-y-7">
        <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(184,101,73,0.08)] px-[14px] py-[6px]">
          <Sparkles className="h-4 w-4 text-app-accent" />
          <span className="text-[13px] font-medium text-app-accent">
            Терапевтичні казки українською
          </span>
        </div>

        <div className="space-y-5">
          <h1 className="font-display text-5xl font-semibold leading-[1.15] text-app-text md:text-[52px]">
            Казки, що допомагають
            <br />
            прожити важливе
          </h1>
          <p className="max-w-[480px] text-[17px] leading-[1.65] text-app-secondary">
            Готові та персоналізовані казки для дітей від психологинь. Допоможіть дитині
            пережити страхи, адаптацію, втрату — через силу терапевтичної історії.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-[14px]">
          <Link href="/catalog">
            <Button className="h-auto gap-2 px-7 py-[14px] text-[15px] font-semibold">
              <BookOpen className="h-[18px] w-[18px]" />
              Обрати казку
            </Button>
          </Link>
          <Link href="/custom-story">
            <Button className="h-auto border border-[rgba(36,27,20,0.12)] bg-[rgba(36,27,20,0.06)] px-7 py-[14px] text-[15px] font-medium text-app-text hover:bg-[rgba(36,27,20,0.1)] hover:text-app-text">
              Замовити індивідуальну
            </Button>
          </Link>
        </div>
      </div>

      <div className="relative h-[320px] overflow-hidden rounded-[28px] md:h-[440px] lg:w-[520px] lg:flex-none">
        <Image
          src="/images/generated-1779051642744.png"
          alt="Дитина читає терапевтичну казку"
          fill
          className="object-cover"
          sizes="(min-width: 1024px) 520px, 100vw"
          priority
        />
      </div>
    </section>
  );
}
