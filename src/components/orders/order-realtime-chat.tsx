'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { getSupabaseBrowserClient } from '@/src/lib/supabase-browser';
import type { ChatMessagePayload } from '@/src/lib/supabase-broadcast';

type Props = {
  orderId: string;
  initialMessages: ChatMessagePayload[];
  myRole: 'CUSTOMER' | 'PSYCHOLOGIST' | 'ADMIN' | 'SUPERADMIN';
  sendAction: (orderId: string, body: string) => Promise<{ ok: boolean; error?: string }>;
};

const ADMIN_ROLES = new Set(['ADMIN', 'SUPERADMIN', 'PSYCHOLOGIST']);

function isMyMessage(authorRole: string, myRole: string): boolean {
  if (ADMIN_ROLES.has(myRole)) return ADMIN_ROLES.has(authorRole);
  return authorRole === myRole;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function OrderRealtimeChat({ orderId, initialMessages, myRole, sendAction }: Props) {
  const [messages, setMessages] = useState<ChatMessagePayload[]>(initialMessages);
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Subscribe to realtime broadcast
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const channel = supabase
      .channel(`order-chat:${orderId}`)
      .on('broadcast', { event: 'message' }, ({ payload }: { payload: ChatMessagePayload }) => {
        setMessages((prev) => {
          // Deduplicate by id
          if (prev.some((m) => m.id === payload.id)) return prev;
          return [...prev, payload];
        });
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [orderId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSend() {
    const trimmed = body.trim();
    if (!trimmed) return;
    setError('');

    startTransition(async () => {
      const result = await sendAction(orderId, trimmed);
      if (result.ok) {
        setBody('');
      } else {
        setError(result.error ?? 'Помилка надсилання');
      }
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSend();
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Message thread */}
      <div className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-app-border bg-app-surface p-4 shadow-soft min-h-[120px]">
        {messages.length === 0 ? (
          <p className="text-sm text-app-muted">Повідомлень поки немає.</p>
        ) : (
          messages.map((msg) => {
            const mine = isMyMessage(msg.authorRole, myRole);
            return (
              <div key={msg.id} className={`flex flex-col gap-1 ${mine ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    mine
                      ? 'rounded-br-sm bg-[var(--fg-primary)] text-white'
                      : 'rounded-bl-sm bg-app-elevated text-app-text'
                  }`}
                >
                  {msg.body}
                </div>
                <span className="px-1 text-xs text-app-muted">
                  {mine ? 'Ви' : msg.authorLabel} · {formatTime(msg.createdAt)}
                </span>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Send form */}
      <div className="flex flex-col gap-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Напишіть повідомлення… (Ctrl+Enter для надсилання)"
          rows={3}
          className="w-full resize-none rounded-[var(--radius-md)] border border-app-border bg-app-elevated px-4 py-3 text-sm text-app-text placeholder:text-app-muted outline-none focus:border-[var(--fg-primary)]"
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <div className="flex justify-end">
          <button
            onClick={handleSend}
            disabled={isPending || !body.trim()}
            className="rounded-full bg-[var(--fg-primary)] px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? 'Надсилання…' : 'Надіслати'}
          </button>
        </div>
      </div>
    </div>
  );
}
