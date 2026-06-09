import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import { CheckoutForm } from '@/src/components/forms/checkout-form'
import { getCheckoutTaleBySlug } from '@/src/server/queries/checkout'

export const dynamic = 'force-dynamic'

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string }>
}) {
  const { slug } = await searchParams

  if (!slug) {
    redirect('/catalog')
  }

  const tale = await getCheckoutTaleBySlug(slug)

  if (!tale) {
    notFound()
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-16 md:px-8">
      <h1 className="mb-8 font-display text-4xl text-app-text">Оформлення замовлення</h1>
      <CheckoutForm tale={tale} />
    </section>
  )
}
