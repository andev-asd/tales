'use client';

import { useState } from 'react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { authClient } from '@/src/lib/auth-client';

export function EmailRegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Паролі не співпадають');
      return;
    }

    setLoading(true);

    try {
      const { error: authError } = await authClient.signUp.email({
        name,
        email,
        password,
        callbackURL: '/library',
      });

      if (authError) {
        if (authError.status === 422 || authError.message?.toLowerCase().includes('already')) {
          setError('Цей email вже зайнятий. Спробуйте увійти або скинути пароль.');
        } else {
          setError(authError.message ?? 'Не вдалося зареєструватись');
        }
        return;
      }

      window.location.href = '/library';
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 rounded-[var(--radius-lg)] border border-app-border bg-app-surface p-8 shadow-soft"
    >
      <Input
        type="text"
        placeholder="Ваше ім'я"
        value={name}
        onChange={(event) => setName(event.target.value)}
        required
        minLength={1}
      />
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />
      <Input
        type="password"
        placeholder="Пароль (мін. 8 символів)"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
        minLength={8}
      />
      <Input
        type="password"
        placeholder="Підтвердіть пароль"
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
        required
        minLength={8}
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={loading}>
        {loading ? 'Реєстрація...' : 'Зареєструватись'}
      </Button>
    </form>
  );
}
