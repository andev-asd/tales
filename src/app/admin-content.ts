export function mapAdminCategoryForView(category: {
  name: string;
  slug: string;
}) {
  return {
    title: category.name,
    slug: category.slug,
  };
}
