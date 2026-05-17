export function mapMessageAuthorLabel(
  authorType: 'customer' | 'psychologist' | 'admin',
) {
  switch (authorType) {
    case 'customer':
      return 'Клієнт';
    case 'psychologist':
      return 'Психолог';
    case 'admin':
      return 'Адміністратор';
  }
}
