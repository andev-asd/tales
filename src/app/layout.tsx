import type { Metadata } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import './globals.css';
import { getCurrentSession } from '@/src/lib/auth';
import { db } from '@/src/lib/db';
import { mapSessionToHeaderUser } from '@/src/lib/session-user';
import { SiteFooter } from '@/src/components/layout/site-footer';
import { SiteHeader } from '@/src/components/layout/site-header';
import { getTotalUnreadForUser } from '@/src/server/queries/unread-counts';

const display = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
});

const body = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: 'Терапевтичні казки',
  description: 'Платформа терапевтичних казок для дітей українською мовою.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getCurrentSession().catch(() => null);
  const baseHeaderUser = mapSessionToHeaderUser(session);
  const appUser = baseHeaderUser?.email
    ? await db.user.upsert({
        where: { email: baseHeaderUser.email },
        update: {
          name: baseHeaderUser.name ?? undefined,
          image: baseHeaderUser.image ?? undefined,
        },
        create: {
          email: baseHeaderUser.email,
          name: baseHeaderUser.name ?? undefined,
          image: baseHeaderUser.image ?? undefined,
        },
        select: { id: true, email: true, role: true },
      })
    : null;
  const headerUser = baseHeaderUser
    ? {
        ...baseHeaderUser,
        id: appUser?.id ?? baseHeaderUser.id ?? null,
        email: appUser?.email ?? baseHeaderUser.email ?? null,
        role: appUser?.role ?? baseHeaderUser.role ?? null,
      }
    : null;
  const totalUnread = appUser?.id ? await getTotalUnreadForUser(appUser.id) : 0;

  return (
    <html lang="uk" translate="no" className="notranslate">
      <body className={`${display.variable} ${body.variable}`}>
        <SiteHeader user={headerUser} unreadCount={totalUnread} />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
