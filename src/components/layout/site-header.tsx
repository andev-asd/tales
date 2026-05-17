import Link from 'next/link';
import { Button } from '@/src/components/ui/button';
import { UserMenu } from './user-menu';

type HeaderUser = {
  name?: string | null;
  image?: string | null;
} | null;

export function SiteHeader({ user }: { user: HeaderUser }) {
  return (
    <header className="sticky top-0 z-40 border-b border-app-border bg-[rgba(247,242,232,0.92)] backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 md:px-8">
        <Link href="/" className="font-display text-2xl italic text-app-text">
          Своя Казка
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-app-secondary md:flex">
          <Link href="/catalog">Каталог казок</Link>
          <Link href="/custom-story">Індивідуальна казка</Link>
          <Link href="/#how-it-works">Як це працює</Link>
          <Link href="/faq">FAQ</Link>
        </nav>

        {user ? <UserMenu user={user} /> : <Link href="/login"><Button>Увійти</Button></Link>}
      </div>
    </header>
  );
}
