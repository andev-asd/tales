type AdminTaleAccess = 'FREE' | 'PAID' | 'PERSONALIZABLE';

export function mapAdminTaleForView(tale: {
  title: string;
  accessType: AdminTaleAccess;
  published: boolean;
  price: number | null;
  personalizationPrice: number | null;
}) {
  const accessMap: Record<AdminTaleAccess, string> = {
    FREE: 'Безкоштовна',
    PAID: 'Платна',
    PERSONALIZABLE: 'Персоналізація',
  };

  return {
    title: tale.title,
    accessLabel: accessMap[tale.accessType],
    publishLabel: tale.published ? 'Опубліковано' : 'Чернетка',
    priceLabel: tale.price === null ? 'Без ціни' : `${tale.price} грн`,
    personalizationPriceLabel:
      tale.personalizationPrice === null
        ? 'Без персоналізації'
        : `${tale.personalizationPrice} грн`,
  };
}
