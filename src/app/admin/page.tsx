import Link from 'next/link';
import { DashboardShell } from '@/src/components/layout/dashboard-shell';
import { getCurrentSession } from '@/src/lib/auth';
import { db } from '@/src/lib/db';
import { getUserRoleLabel } from '@/src/lib/user-access';

export const dynamic = 'force-dynamic';

const adminItems = [
  { href: '/admin/users', label: 'Користувачі' },
  { href: '/admin/tales', label: 'Керування книгами' },
  { href: '/admin/categories', label: 'Категорії' },
  { href: '/admin/orders', label: 'Переписка з клієнтом' },
];

export default async function AdminPage() {
  const session = await getCurrentSession().catch(() => null);
  const appUser = session?.user?.email
    ? await db.user.findUnique({
        where: { email: session.user.email },
        select: { role: true },
      })
    : null;
  const role = appUser?.role ?? null;
  const isSuperadmin = role === 'SUPERADMIN';

  return (
    <DashboardShell title="Адмінка" items={adminItems}>
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.24em] text-app-secondary">
            {role ? getUserRoleLabel(role) : 'Адмін'}
          </p>
          <h1 className="font-display text-4xl text-app-text">Панель керування сайтом</h1>
          <p className="max-w-3xl text-sm text-app-secondary">
            Адмін керує користувачами, книгами, листуванням із клієнтами та вмістом сайту.
            Суперадмін додатково керує адміністраторами й суперадміністраторами у розділі
            користувачів.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Link
            href="/admin/users"
            className="rounded-[var(--radius-lg)] border border-app-border bg-app-surface p-6 shadow-soft"
          >
            <h2 className="font-display text-2xl text-app-text">Користувачі</h2>
            <p className="mt-2 text-sm text-app-secondary">
              {isSuperadmin
                ? 'Керування користувачами, адміністраторами та суперадмінами.'
                : 'Керування користувачами та психологами.'}
            </p>
          </Link>
          <Link
            href="/admin/tales"
            className="rounded-[var(--radius-lg)] border border-app-border bg-app-surface p-6 shadow-soft"
          >
            <h2 className="font-display text-2xl text-app-text">Книги</h2>
            <p className="mt-2 text-sm text-app-secondary">
              Створення, редагування та публікація книжок і пов'язаних матеріалів.
            </p>
          </Link>
          <Link
            href="/admin/categories"
            className="rounded-[var(--radius-lg)] border border-app-border bg-app-surface p-6 shadow-soft"
          >
            <h2 className="font-display text-2xl text-app-text">Категорії</h2>
            <p className="mt-2 text-sm text-app-secondary">
              Структура каталогу та керування розділами сайту.
            </p>
          </Link>
          <Link
            href="/admin/orders"
            className="rounded-[var(--radius-lg)] border border-app-border bg-app-surface p-6 shadow-soft"
          >
            <h2 className="font-display text-2xl text-app-text">Переписка</h2>
            <p className="mt-2 text-sm text-app-secondary">
              Робота з клієнтськими замовленнями, повідомленнями та супроводом.
            </p>
          </Link>
        </div>
      </div>
    </DashboardShell>
  );
}
