"use client";

import { useState } from 'react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { authClient } from '@/src/lib/auth-client';
import { buildEmailSignInPayload } from '@/src/lib/email-auth';

export function EmailLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const { error: authError } = await authClient.signIn.email(
      buildEmailSignInPayload(email, password, '/library'),
    );

    if (authError) {
      setError(authError.message ?? 'Не вдалося виконати вхід');
      return;
    }

    window.location.href = '/library';
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 rounded-[var(--radius-lg)] border border-app-border bg-app-surface p-8 shadow-soft"
    >
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <Input
        type="password"
        placeholder="Пароль"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit">Увійти</Button>
    </form>
  );
}
