'use client';

import { Button } from '@/src/components/ui/button';

type LoginFormProps = {
  onGoogleSignIn?: () => void | Promise<void>;
  onEmailSignIn?: () => void | Promise<void>;
};

export function LoginForm({
  onGoogleSignIn,
  onEmailSignIn,
}: LoginFormProps) {
  const handleGoogleSignIn = async () => {
    if (onGoogleSignIn) {
      await onGoogleSignIn();
      return;
    }

    const response = await fetch('/api/auth/sign-in/social', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider: 'google',
        callbackURL: '/library',
      }),
    });

    if (!response.ok) {
      throw new Error('Не вдалося розпочати вхід через Google');
    }

    const data = (await response.json()) as {
      url?: string;
      redirect?: boolean;
    };

    if (data.redirect && data.url) {
      window.location.href = data.url;
    }
  };

  const handleEmailSignIn = async () => {
    if (onEmailSignIn) {
      await onEmailSignIn();
      return;
    }

    window.location.href = '/login/email';
  };

  return (
    <div className="grid gap-4 rounded-[var(--radius-lg)] border border-app-border bg-app-surface p-8 shadow-soft">
      <Button className="w-full" onClick={handleGoogleSignIn}>
        Продовжити з Google
      </Button>
      <Button
        className="w-full bg-transparent text-app-text ring-1 ring-app-border hover:bg-app-elevated hover:text-app-text"
        onClick={handleEmailSignIn}
      >
        Увійти з email
      </Button>
    </div>
  );
}
