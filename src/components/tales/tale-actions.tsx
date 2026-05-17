'use client';

import { useState, useTransition } from 'react';
import { addFreeTaleToLibraryAction } from '@/src/server/actions/add-free-tale-to-library';
import { Button } from '@/src/components/ui/button';

type TaleActionsProps = {
  tale: {
    id: string;
    accessType: 'FREE' | 'PAID' | 'PERSONALIZABLE';
  };
};

export function TaleActions({ tale }: TaleActionsProps) {
  const [notice, setNotice] = useState('');
  const [isPending, startTransition] = useTransition();

  if (tale.accessType === 'FREE') {
    return (
      <div className="mt-8 space-y-3">
        <Button
          disabled={isPending}
          onClick={() => {
            startTransition(async () => {
              const result = await addFreeTaleToLibraryAction(tale.id);
              setNotice(result.message);
            });
          }}
        >
          {isPending ? 'Додаємо...' : 'Додати в колекцію'}
        </Button>
        {notice ? <p className="text-sm text-app-secondary">{notice}</p> : null}
      </div>
    );
  }

  if (tale.accessType === 'PERSONALIZABLE') {
    return (
      <div className="mt-8 flex flex-wrap gap-4">
        <Button>Купити шаблон</Button>
        <Button className="bg-transparent text-app-text ring-1 ring-app-border hover:bg-app-surface hover:text-app-text">
          Персоналізувати ім’ям
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <Button>Оформити замовлення</Button>
    </div>
  );
}
