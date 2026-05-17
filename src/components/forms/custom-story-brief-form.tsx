'use client';

import { Button } from '@/src/components/ui/button';

export function CustomStoryBriefForm() {
  return (
    <form className="grid gap-4 rounded-[var(--radius-lg)] border border-app-border bg-app-surface p-8 shadow-soft">
      <input
        name="childName"
        placeholder="Ім’я дитини"
        className="rounded-[var(--radius-md)] border border-app-border bg-app-elevated px-4 py-3 text-app-text outline-none"
      />
      <textarea
        name="brief"
        rows={6}
        placeholder="Що відбувається зараз? Який результат ви хочете отримати через казку?"
        className="rounded-[var(--radius-md)] border border-app-border bg-app-elevated px-4 py-3 text-app-text outline-none"
      />
      <Button type="submit">Надіслати бриф</Button>
    </form>
  );
}
