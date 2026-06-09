# Therapeutic Tales MVP

Україномовна MVP-платформа терапевтичних казок з каталогом, індивідуальними замовленнями, role-based кабінетами та захищеним завантаженням PDF.

## Локальний запуск

1. Скопіюйте `.env.example` у `.env.local`
2. Заповніть змінні для Supabase, Better Auth і Google OAuth
3. Встановіть залежності: `npm install --cache ./.npm-cache`
4. Згенеруйте Prisma Client: `npm run db:generate`
5. Створіть локальну схему: `npm run db:migrate`
6. Заповніть тестовими даними: `npm run db:seed`
7. Запустіть dev-сервер: `npm run dev`

Локальний застосунок завжди запускається на `127.0.0.1:3002`.

Для стабільного показу замовнику використовуйте preview-режим замість `next dev`:

```bash
npm run preview
```

Це збирає production-версію та запускає її на тому ж порту `3002`, без нестабільностей dev overlay.

## Перевірки

- Unit tests: `npm run test`
- E2E: `npm run test:e2e`
- Build: `npm run build`

## Порт для E2E

Playwright запускає локальний Next dev server на `127.0.0.1:3002`, щоб використовувати той самий зафіксований dev-порт проєкту.

## Авторизація

- Better Auth
- Google OAuth
- Redirect URI для локального середовища: `http://localhost:3000/api/auth/callback/google`

## Деплой

- Vercel для Next.js
- Supabase для Postgres і Storage
# tales
