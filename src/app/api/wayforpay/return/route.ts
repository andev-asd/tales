import { NextRequest, NextResponse } from 'next/server'

// WayForPay redirects the browser to returnUrl via POST after successful payment.
// Next.js rejects POST requests to page routes (treats them as Server Actions),
// so we use this API route as the returnUrl and redirect to the orders page.
export async function POST(req: NextRequest) {
  let orderReference: string | null = null

  try {
    const formData = await req.formData()
    orderReference = formData.get('orderReference') as string | null
  } catch {
    // ignore parse errors
  }

  const destination = orderReference
    ? `/orders/${orderReference}?paid=1`
    : '/orders'

  return NextResponse.redirect(new URL(destination, req.nextUrl.origin), 303)
}

export async function GET(req: NextRequest) {
  const orderReference = req.nextUrl.searchParams.get('orderReference')

  const destination = orderReference
    ? `/orders/${orderReference}?paid=1`
    : '/orders'

  return NextResponse.redirect(new URL(destination, req.nextUrl.origin), 303)
}
