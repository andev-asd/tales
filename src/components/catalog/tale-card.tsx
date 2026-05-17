import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

type TaleCardProps = {
  tale: {
    title: string;
    slug: string;
    shortDescription: string;
    accessType: 'FREE' | 'PAID' | 'PERSONALIZABLE';
    coverUrl?: string | null;
  };
};

function accessLabel(accessType: TaleCardProps['tale']['accessType']) {
  switch (accessType) {
    case 'FREE':
      return 'Безкоштовна';
    case 'PAID':
      return 'Платна';
    case 'PERSONALIZABLE':
      return 'Персоналізація';
  }
}

function ctaLabel(accessType: TaleCardProps['tale']['accessType']) {
  switch (accessType) {
    case 'FREE':
      return 'Читати';
    case 'PAID':
      return 'Придбати';
    case 'PERSONALIZABLE':
      return 'Персоналізувати';
  }
}

export function TaleCard({ tale }: TaleCardProps) {
  return (
    <div className="overflow-hidden rounded-[20px] border border-[#e8dfd1] bg-white">
      {tale.coverUrl ? (
        <img
          src={tale.coverUrl}
          alt={tale.title}
          className="h-[200px] w-full object-cover"
        />
      ) : null}
      <div className="flex flex-col gap-2.5 px-6 py-5">
        <span className="self-start rounded-full bg-app-accentSecondary/10 px-3 py-1 text-xs font-medium text-app-secondary">
          {accessLabel(tale.accessType)}
        </span>
        <h3 className="font-display text-xl font-semibold text-app-text">
          {tale.title}
        </h3>
        <p className="text-sm leading-relaxed text-app-secondary">
          {tale.shortDescription}
        </p>
        <Link
          href={`/tales/${tale.slug}`}
          className="mt-1 flex items-center gap-1.5 self-start rounded-full bg-app-accent/10 px-5 py-2.5 text-sm font-semibold text-app-accent"
        >
          {ctaLabel(tale.accessType)}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
