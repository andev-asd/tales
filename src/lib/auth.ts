import { prismaAdapter } from '@better-auth/prisma-adapter';
import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';
import { headers } from 'next/headers';
import { authModelNames } from './auth-schema';
import { db } from './db';
import { getEnv } from './env';
import { sendVerificationEmail, sendPasswordResetEmail } from '@/src/server/emails/auth';

export function createAuth() {
  const env = getEnv();

  return betterAuth({
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    user: {
      modelName: authModelNames.user,
    },
    session: {
      modelName: authModelNames.session,
    },
    account: {
      modelName: authModelNames.account,
    },
    verification: {
      modelName: authModelNames.verification,
    },
    database: prismaAdapter(db, {
      provider: 'postgresql',
    }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      sendResetPassword: async ({ user, url }: { user: { email: string }; url: string }) => {
        await sendPasswordResetEmail(user.email, url);
      },
    },
    emailVerification: {
      sendVerificationEmail: async ({ user, url }: { user: { email: string }; url: string }) => {
        await sendVerificationEmail(user.email, url);
      },
    },
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        prompt: 'select_account',
      },
    },
    plugins: [nextCookies()],
  });
}

export async function getCurrentSession() {
  const auth = createAuth();

  return auth.api.getSession({
    headers: await headers(),
  });
}
