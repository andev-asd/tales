import { NextResponse } from 'next/server';

import { searchNovaPoshtaWarehouses } from '@/src/server/integrations/nova-poshta';

const UNAVAILABLE_MESSAGE =
  'Сервіс Нової Пошти тимчасово недоступний. Введіть відділення вручну.';

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const cityRef = params.get('cityRef')?.trim() ?? '';
  const query = params.get('q')?.trim() ?? '';

  if (!cityRef || cityRef.length > 100 || query.length > 100) {
    return NextResponse.json(
      { error: 'Некоректні параметри пошуку' },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json({
      options: await searchNovaPoshtaWarehouses(cityRef, query),
    });
  } catch {
    return NextResponse.json(
      { error: UNAVAILABLE_MESSAGE },
      { status: 502 },
    );
  }
}
