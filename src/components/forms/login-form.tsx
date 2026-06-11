'use client';

import { useState } from 'react';

type LoginFormProps = {
  onGoogleSignIn?: () => void | Promise<void>;
  onEmailSignIn?: () => void | Promise<void>;
  onEmailRegister?: () => void | Promise<void>;
};

export function LoginForm({
  onGoogleSignIn,
  onEmailSignIn,
  onEmailRegister,
}: LoginFormProps) {
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoadingGoogle(true);
    try {
      if (onGoogleSignIn) {
        await onGoogleSignIn();
        return;
      }

      const response = await fetch('/api/auth/sign-in/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'google', callbackURL: '/library' }),
      });

      if (!response.ok) throw new Error();

      const data = (await response.json()) as { url?: string; redirect?: boolean };
      if (data.redirect && data.url) window.location.href = data.url;
    } catch {
      setLoadingGoogle(false);
    }
  };

  const handleEmailSignIn = async () => {
    if (onEmailSignIn) { await onEmailSignIn(); return; }
    window.location.href = '/login/email';
  };

  const handleEmailRegister = async () => {
    if (onEmailRegister) { await onEmailRegister(); return; }
    window.location.href = '/register';
  };

  return (
    <div className="w-full space-y-3">
      {/* Google — primary CTA */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loadingGoogle}
        className="flex w-full items-center justify-center gap-3 rounded-[var(--radius-md)] border border-app-border bg-app-surface px-5 py-3.5 text-[15px] font-medium text-app-text shadow-soft transition-all hover:bg-app-elevated hover:shadow-md active:scale-[0.99] disabled:opacity-60"
      >
        {loadingGoogle ? (
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-app-border border-t-app-text" />
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        )}
        {loadingGoogle ? 'Підключення…' : 'Продовжити з Google'}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 py-1">
        <div className="h-px flex-1 bg-app-border" />
        <span className="text-xs text-app-muted">або</span>
        <div className="h-px flex-1 bg-app-border" />
      </div>

      {/* Email options */}
      <button
        type="button"
        onClick={handleEmailSignIn}
        className="flex w-full items-center justify-center gap-2.5 rounded-[var(--radius-md)] border border-app-border bg-transparent px-5 py-3 text-[15px] font-medium text-app-text transition-all hover:bg-app-elevated active:scale-[0.99]"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <rect x="2" y="4" width="20" height="16" rx="3"/>
          <path d="m2 7 10 7 10-7"/>
        </svg>
        Увійти з email
      </button>

      <button
        type="button"
        onClick={handleEmailRegister}
        className="flex w-full items-center justify-center gap-2.5 rounded-[var(--radius-md)] border border-app-border bg-transparent px-5 py-3 text-[15px] font-medium text-app-text transition-all hover:bg-app-elevated active:scale-[0.99]"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M20 8v6M17 11h6"/>
        </svg>
        Зареєструватись
      </button>
    </div>
  );
}
