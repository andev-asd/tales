"use client";

import { useState } from 'react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { buildChangePasswordPayload } from '@/src/lib/email-auth';

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const payload = buildChangePasswordPayload(currentPassword, newPassword);

    const response = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({ message: 'Не вдалося змінити пароль' }));
      setError(body.message ?? 'Не вдалося змінити пароль');
      return;
    }

    setMessage('Пароль успішно змінено');
    setCurrentPassword('');
    setNewPassword('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 rounded-[var(--radius-lg)] border border-app-border bg-app-surface p-8 shadow-soft"
    >
      <Input
        type="password"
        placeholder="Поточний пароль"
        value={currentPassword}
        onChange={(event) => setCurrentPassword(event.target.value)}
      />
      <Input
        type="password"
        placeholder="Новий пароль"
        value={newPassword}
        onChange={(event) => setNewPassword(event.target.value)}
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm text-green-700">{message}</p> : null}
      <Button type="submit">Змінити пароль</Button>
    </form>
  );
}
