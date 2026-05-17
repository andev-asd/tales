import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function ProductPaths() {
  return (
    <section className="bg-[#fcfaf7]">
      <div className="mx-auto max-w-7xl px-4 py-[72px] text-center md:px-8">
        <h2 className="font-display text-[32px] font-semibold text-app-text">Оберіть формат</h2>
        <div className="mt-8 flex justify-center">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 rounded-full bg-app-accent px-6 py-3 text-sm font-semibold text-white"
          >
            Переглянути каталог
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
