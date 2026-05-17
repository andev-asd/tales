import Link from 'next/link';

type DashboardShellProps = {
  title: string;
  items: Array<{ href: string; label: string }>;
  children: React.ReactNode;
};

export function DashboardShell({
  title,
  items,
  children,
}: DashboardShellProps) {
  return (
    <div className="grid min-h-[calc(100vh-81px)] md:grid-cols-[260px_1fr]">
      <aside className="border-r border-app-border bg-app-surface p-6 shadow-soft">
        <h2 className="font-display text-3xl text-app-text">{title}</h2>
        <nav className="mt-8 flex flex-col gap-3 text-app-secondary">
          {items.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="p-6 md:p-10">{children}</main>
    </div>
  );
}
