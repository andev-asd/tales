'use client';

import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';

type CategoryFormProps = {
  action?: (formData: FormData) => void | Promise<void>;
  defaultValues?: {
    name: string;
    slug: string;
  };
};

export function CategoryForm({ action, defaultValues }: CategoryFormProps) {
  return (
    <form action={action} className="grid gap-4 rounded-[var(--radius-lg)] border border-app-border bg-app-surface p-8 shadow-soft">
      <Input name="name" placeholder="Назва категорії" defaultValue={defaultValues?.name} />
      <Input name="slug" placeholder="slug" defaultValue={defaultValues?.slug} />
      <Button type="submit">Зберегти категорію</Button>
    </form>
  );
}
