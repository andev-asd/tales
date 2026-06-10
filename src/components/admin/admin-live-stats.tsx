'use client';

import { useCallback, useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '@/src/lib/supabase-browser';

type Stats = { newOrders: number; unreadMessages: number };

export function AdminLiveStats({ initial }: { initial: Stats }) {
  const [stats, setStats] = useState(initial);

  const refetch = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) setStats(await res.json() as Stats);
    } catch {
      // network issue — stale value stays
    }
  }, []);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    const channel = supabase
      .channel('admin-stats')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'Order' }, () => {
        void refetch();
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'Order' }, () => {
        void refetch();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'OrderMessage' }, () => {
        void refetch();
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [refetch]);

  if (stats.newOrders === 0 && stats.unreadMessages === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {stats.newOrders > 0 && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          Нових замовлень: {stats.newOrders}
        </span>
      )}
      {stats.unreadMessages > 0 && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          Нових повідомлень: {stats.unreadMessages}
        </span>
      )}
    </div>
  );
}
