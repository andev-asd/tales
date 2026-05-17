import { notFound } from 'next/navigation';
import { TaleForm } from '@/src/components/forms/tale-form';
import { updateTaleAction } from '@/src/server/actions/admin-tales';
import { DashboardShell } from '@/src/components/layout/dashboard-shell';
import { getAdminCategories } from '@/src/server/queries/admin';
import { getAdminTaleDetail } from '@/src/server/queries/admin-tale-detail';

type AdminTaleDetail = NonNullable<Awaited<ReturnType<typeof getAdminTaleDetail>>>;

export const dynamic = 'force-dynamic';

export default async function AdminEditTalePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [tale, categories] = await Promise.all([
    getAdminTaleDetail(id),
    getAdminCategories(),
  ]);

  if (!tale) {
    notFound();
  }

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
        <h1 className="font-display text-4xl text-app-text">Редагування казки</h1>
        <TaleForm
          action={updateTaleAction.bind(null, tale.id)}
          categories={categories}
          defaultValues={{
            title: tale.title,
            slug: tale.slug,
            shortDescription: tale.shortDescription,
            fullDescription: tale.fullDescription,
            accessType: tale.accessType,
            price: tale.price,
            personalizationPrice: tale.personalizationPrice,
            published: tale.published,
            categoryIds: tale.categories.map((item: AdminTaleDetail['categories'][number]) => item.categoryId),
            imagePaths: tale.imagePaths,
            imagePreviewUrls: tale.imagePreviewUrls,
            pdfPath: tale.pdfPath,
            taleId: tale.id,
          }}
        />
      </div>
    </DashboardShell>
  );
}
