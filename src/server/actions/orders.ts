export type UiOrderType =
  | 'ready_tale'
  | 'personalized_template'
  | 'custom_psychologist';

export function mapOrderTypeLabel(type: UiOrderType) {
  switch (type) {
    case 'ready_tale':
      return 'Готова казка';
    case 'personalized_template':
      return 'Персоналізація шаблону';
    case 'custom_psychologist':
      return 'Індивідуальна казка з психологом';
  }
}
