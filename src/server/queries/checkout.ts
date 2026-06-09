import { db } from '@/src/lib/db'
import { getPublicImageUrl } from '@/src/lib/storage'

export async function getCheckoutTaleBySlug(slug: string) {
  const tale = await db.tale.findFirst({
    where: { slug, published: true },
    select: {
      id: true,
      title: true,
      slug: true,
      shortDescription: true,
      accessType: true,
      price: true,
      coverPath: true,
    },
  })

  if (!tale) return null

  return {
    ...tale,
    coverUrl: tale.coverPath ? getPublicImageUrl(tale.coverPath) : null,
  }
}
