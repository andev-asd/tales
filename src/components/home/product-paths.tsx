import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Check, Library, PenTool } from 'lucide-react';

export function ProductPaths() {
  return (
    <section className="mx-auto max-w-7xl px-8 py-[72px]">
      <div className="mb-10 flex flex-col items-center gap-3 text-center">
        <h2 className="font-display text-[32px] font-semibold text-app-text">
          Два шляхи до казки
        </h2>
        <p className="text-base text-app-secondary">
          Оберіть готову казку з каталогу або замовте персональну історію
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Ready Tales */}
        <div className="flex flex-col gap-5 rounded-[20px] border border-[#e8dfd1] bg-app-elevated p-9">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{ backgroundColor: '#7a907115' }}
          >
            <Library className="h-[26px] w-[26px] text-app-accentSecondary" />
          </div>
          <h3 className="font-display text-2xl font-semibold text-app-text">Готові казки</h3>
          <p className="text-[15px] leading-[1.6] text-app-secondary">
            Безкоштовні, платні та персоналізовані шаблони казок. Обирайте з каталогу за ситуацією та отримуйте PDF одразу.
          </p>
          <div className="flex flex-col gap-2.5">
            {[
              'Безкоштовні казки',
              'Платні казки з миттєвим доступом',
              'Персоналізація під вашу дитину',
            ].map((feat) => (
              <div key={feat} className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-app-accentSecondary" />
                <span className="text-[14px] text-app-secondary">{feat}</span>
              </div>
            ))}
          </div>
          <div className="relative h-[180px] w-full overflow-hidden rounded-2xl">
            <Image
              src="/images/generated-1779051798877.png"
              alt="Готові казки"
              fill
              className="object-cover"
            />
          </div>
          <Link
            href="/catalog"
            className="flex items-center justify-center gap-2 rounded-pill bg-app-accentSecondary px-6 py-3 text-[14px] font-semibold text-white"
          >
            Переглянути каталог
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Individual Tale */}
        <div
          className="flex flex-col gap-5 rounded-[20px] p-9"
          style={{ backgroundColor: '#2f4058', border: '1px solid #3d5070' }}
        >
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{ backgroundColor: '#ffffff15' }}
          >
            <PenTool className="h-[26px] w-[26px] text-white" />
          </div>
          <h3 className="font-display text-2xl font-semibold text-white">Індивідуальна казка</h3>
          <p className="text-[15px] leading-[1.6]" style={{ color: '#ffffffcc' }}>
            Психологиня створить унікальну казку саме для вашої дитини. Бриф, листування, персональна історія.
          </p>
          <div className="flex flex-col gap-2.5">
            {[
              'Заповніть короткий бриф',
              'Листування з психологинею',
              'Отримайте унікальну казку',
            ].map((feat) => (
              <div key={feat} className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-app-accent" />
                <span className="text-[14px]" style={{ color: '#ffffffbb' }}>{feat}</span>
              </div>
            ))}
          </div>
          <div className="relative h-[180px] w-full overflow-hidden rounded-2xl">
            <Image
              src="/images/generated-1779051844983.png"
              alt="Індивідуальна казка"
              fill
              className="object-cover"
            />
          </div>
          <Link
            href="/custom-story"
            className="flex items-center justify-center gap-2 rounded-pill bg-app-accent px-6 py-3 text-[14px] font-semibold text-white"
          >
            Замовити казку
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
