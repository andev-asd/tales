import { LibraryDownloadButton } from '@/src/components/library/library-download-button';
import { getCurrentSession } from '@/src/lib/auth';
import { db } from '@/src/lib/db';
import { mapLibraryItemForView } from '@/src/lib/customer-data';
import { getLibraryForUser } from '@/src/server/queries/customer';

type LibraryItem = Awaited<ReturnType<typeof getLibraryForUser>>[number];

export const dynamic = 'force-dynamic';

export default async function LibraryPage() {
  const session = await getCurrentSession().catch(() => null);
  const appUser = session?.user?.email
    ? await db.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      })
    : null;
  const items = appUser?.id ? await getLibraryForUser(appUser.id) : [];

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:px-8">
      <div className="space-y-6">
        <h1 className="font-display text-5xl text-app-text">Моя колекція</h1>
        <p className="text-lg leading-8 text-app-secondary">
          Тут зберігаються безкоштовні, придбані та персоналізовані казки.
        </p>
        <div className="grid gap-4">
          {items.map((item: LibraryItem) => {
            const view = mapLibraryItemForView(item);

            return (
              <div
                key={item.id}
                className="grid gap-6 rounded-[var(--radius-lg)] border border-app-border bg-app-surface p-6 shadow-soft md:grid-cols-[160px_minmax(0,1fr)] md:items-start"
              >
                {view.coverUrl ? (
                  <img
                    src={view.coverUrl}
                    alt={view.title}
                    className="h-48 w-full rounded-[var(--radius-md)] object-cover md:h-56"
                  />
                ) : null}
                <div>
                  <h2 className="font-display text-2xl text-app-text">{view.title}</h2>
                  <p className="mt-2 text-app-secondary">{view.status}</p>
                  <LibraryDownloadButton libraryItemId={item.id} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
