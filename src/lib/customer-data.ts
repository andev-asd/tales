type LibrarySource = 'FREE_ADDED' | 'PURCHASED' | 'PERSONALIZED' | 'CUSTOM';
type OrderType = 'READY_TALE' | 'PERSONALIZED_TEMPLATE' | 'CUSTOM_PSYCHOLOGIST';
type OrderStatus =
  | 'NEW'
  | 'IN_REVIEW'
  | 'IN_PROGRESS'
  | 'AWAITING_CUSTOMER'
  | 'COMPLETED'
  | 'CANCELLED';
type UserRole = 'CUSTOMER' | 'PSYCHOLOGIST' | 'ADMIN' | 'SUPERADMIN';

export function mapLibraryItemForView(item: {
  tale: { title: string; coverUrl?: string | null };
  source: LibrarySource;
}) {
  const statusMap: Record<LibrarySource, string> = {
    FREE_ADDED: 'Безкоштовно додано',
    PURCHASED: 'Придбано',
    PERSONALIZED: 'Персоналізовано',
    CUSTOM: 'Індивідуально створено',
  };

  return {
    title: item.tale.title,
    coverUrl: item.tale.coverUrl ?? null,
    status: statusMap[item.source],
  };
}

export function mapOrderForView(order: {
  type: OrderType;
  status: OrderStatus;
  hasAccessibleResult?: boolean;
}) {
  const typeMap: Record<OrderType, string> = {
    READY_TALE: 'Готова казка',
    PERSONALIZED_TEMPLATE: 'Персоналізація шаблону',
    CUSTOM_PSYCHOLOGIST: 'Індивідуальна казка з психологом',
  };

  const statusMap: Record<OrderStatus, string> = {
    NEW: 'Нове',
    IN_REVIEW: 'На розгляді',
    IN_PROGRESS: 'У роботі',
    AWAITING_CUSTOMER: 'Потрібна відповідь клієнта',
    COMPLETED: 'Завершено',
    CANCELLED: 'Скасовано',
  };

  return {
    typeLabel: typeMap[order.type],
    statusLabel: statusMap[order.status],
    resultStateLabel:
      order.status === 'COMPLETED'
        ? order.hasAccessibleResult
          ? 'Казка вже доступна у бібліотеці'
          : 'Казка ще не доступна'
        : 'Результат ще готується',
  };
}

export function mapOrderMessageForView(message: {
  id: string;
  author: { role: UserRole; name: string | null };
  body: string;
  createdAt: Date;
}) {
  const roleMap: Record<UserRole, string> = {
    CUSTOMER: 'Клієнт',
    PSYCHOLOGIST: 'Психолог',
    ADMIN: 'Адміністратор',
    SUPERADMIN: 'Superadmin',
  };

  return {
    id: message.id,
    authorLabel: roleMap[message.author.role],
    authorRole: message.author.role,
    body: message.body,
    createdAt: message.createdAt.toISOString(),
  };
}
