import { mapAdminCategoryForView } from '@/src/app/admin-content';
import { DashboardShell } from '@/src/components/layout/dashboard-shell';
import { CategoryForm } from '@/src/components/forms/category-form';
import { saveCategoryAction } from '@/src/server/actions/admin-categories';
import { getAdminCategories } from '@/src/server/queries/admin';

type AdminCategory = Awaited<ReturnType<typeof getAdminCategories>>[number];

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();

  return (
    <DashboardShell
      title="Адмін"
      items={[
        { href: '/admin/users', label: 'Користувачі' },
        { href: '/admin/tales', label: 'Керування казками' },
        { href: '/admin/categories', label: 'Категорії' },
        { href: '/admin/orders', label: 'Замовлення' },
      ]}
    >
      <div className="space-y-6">
        <h1 className="font-display text-4xl text-app-text">Категорії</h1>
        <CategoryForm action={saveCategoryAction} />
        <div className="grid gap-4">
          {categories.map((category: AdminCategory) => {
            const view = mapAdminCategoryForView(category);

            return (
              <div
                key={category.id}
                className="rounded-[var(--radius-lg)] border border-app-border bg-app-surface p-6 shadow-soft"
              >
                <h2 className="font-display text-2xl text-app-text">{view.title}</h2>
                <p className="mt-2 text-sm text-app-secondary">Slug: {view.slug}</p>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardShell>
  );
}
