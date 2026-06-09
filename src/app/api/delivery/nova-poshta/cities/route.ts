import { NextResponse } from 'next/server';

import { searchNovaPoshtaCities } from '@/src/server/integrations/nova-poshta';

const UNAVAILABLE_MESSAGE =
  'Сервіс Нової Пошти тимчасово недоступний. Введіть місто вручну.';

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get('q')?.trim() ?? '';

  if (query.length > 100) {
    return NextResponse.json(
      { error: 'Некоректний пошуковий запит' },
      { status: 400 },
    );
  }

  if (query.length < 2) {
    return NextResponse.json({ options: [] });
  }

  try {
    return NextResponse.json({
      options: await searchNovaPoshtaCities(query),
    });
  } catch {
    return NextResponse.json(
      { error: UNAVAILABLE_MESSAGE },
      { status: 502 },
    );
  }
}
