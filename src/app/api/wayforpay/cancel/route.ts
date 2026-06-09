import { NextRequest, NextResponse } from 'next/server'

// WayForPay redirects the browser to cancelUrl via POST when payment is cancelled/declined.
// We redirect the user back to the payment page with ?failed=1 to show the error UI.
export async function POST(req: NextRequest) {
  let orderReference: string | null = null

  try {
    const formData = await req.formData()
    orderReference = formData.get('orderReference') as string | null
  } catch {
    // ignore parse errors
  }

  const destination = orderReference
    ? `/payment/${orderReference}?failed=1`
    : '/orders'

  return NextResponse.redirect(new URL(destination, req.nextUrl.origin), 303)
}

export async function GET(req: NextRequest) {
  const orderReference = req.nextUrl.searchParams.get('orderReference')

  const destination = orderReference
    ? `/payment/${orderReference}?failed=1`
    : '/orders'

  return NextResponse.redirect(new URL(destination, req.nextUrl.origin), 303)
}
