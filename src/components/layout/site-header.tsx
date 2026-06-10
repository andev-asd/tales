import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { UserMenu } from './user-menu';

type HeaderUser = {
  name?: string | null;
  image?: string | null;
  id?: string | null;
  email?: string | null;
  role?: 'CUSTOMER' | 'PSYCHOLOGIST' | 'ADMIN' | 'SUPERADMIN' | null;
} | null;

export function SiteHeader({ user, unreadCount = 0 }: { user: HeaderUser; unreadCount?: number }) {
  return (
    <header className="sticky top-0 z-40 border-b border-app-border bg-[rgba(247,242,232,0.92)] backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-0" style={{ height: 72 }}>
        <Link href="/" className="flex items-center gap-2.5">
          <BookOpen className="h-7 w-7 text-app-accent" />
          <span className="font-display text-[22px] font-semibold text-app-text">Своя Казка</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/catalog" className="text-[15px] font-medium text-app-secondary hover:text-app-text">Каталог</Link>
          <Link href="/custom-story" className="text-[15px] font-medium text-app-secondary hover:text-app-text">Індивідуальна казка</Link>
          <Link href="/#how-it-works" className="text-[15px] font-medium text-app-secondary hover:text-app-text">Як це працює</Link>
          <Link href="/faq" className="text-[15px] font-medium text-app-secondary hover:text-app-text">FAQ</Link>
        </nav>

        {user ? (
          <UserMenu user={user} unreadCount={unreadCount} />
        ) : (
          <Link
            href="/login"
            className="rounded-pill border border-app-border bg-app-surface px-4 py-2.5 text-[15px] font-medium text-app-text shadow-sm"
          >
            Увійти
          </Link>
        )}
      </div>
    </header>
  );
}
