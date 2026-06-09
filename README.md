# Therapeutic Tales MVP

Україномовна MVP-платформа терапевтичних казок з каталогом, індивідуальними замовленнями, role-based кабінетами та захищеним завантаженням PDF.

## Локальний запуск

1. Скопіюйте `.env.example` у `.env.local`
2. Заповніть змінні для Supabase, Better Auth і Google OAuth
3. Встановіть залежності: `pnpm install --frozen-lockfile`
4. Згенеруйте Prisma Client: `pnpm db:generate`
5. Створіть локальну схему: `pnpm db:migrate`
6. Заповніть тестовими даними: `pnpm db:seed`
7. Запустіть dev-сервер: `pnpm dev`

Локальний застосунок завжди запускається на `127.0.0.1:3002`.

Для стабільного показу замовнику використовуйте preview-режим замість `next dev`:

```bash
pnpm preview
```

Це збирає production-версію та запускає її на тому ж порту `3002`, без нестабільностей dev overlay.

## Перевірки

- Unit tests: `pnpm test`
- E2E: `pnpm test:e2e`
- Build: `pnpm build`

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
