import Link from 'next/link';
import { Badge } from '@/src/components/ui/badge';
import { Card } from '@/src/components/ui/card';

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

export function TaleCard({ tale }: TaleCardProps) {
  return (
    <Card>
      {tale.coverUrl ? (
        <img src={tale.coverUrl} alt={tale.title} className="h-56 w-full rounded-[var(--radius-md)] object-cover" />
      ) : null}
      <Badge>{accessLabel(tale.accessType)}</Badge>
      <h3 className="mt-4 font-display text-2xl text-app-text">{tale.title}</h3>
      <p className="mt-3 leading-7 text-app-secondary">{tale.shortDescription}</p>
      <Link
        href={`/tales/${tale.slug}`}
        className="mt-5 inline-flex text-sm font-medium text-app-accent"
      >
        Детальніше
      </Link>
    </Card>
  );
}
