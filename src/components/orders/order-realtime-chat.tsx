'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { getSupabaseBrowserClient } from '@/src/lib/supabase-browser';
import type { ChatMessagePayload } from '@/src/lib/supabase-broadcast';

type SendResult =
  | { ok: true; message: ChatMessagePayload }
  | { ok: false; error: string };

type Props = {
  orderId: string;
  initialMessages: ChatMessagePayload[];
  myRole: 'CUSTOMER' | 'PSYCHOLOGIST' | 'ADMIN' | 'SUPERADMIN';
  sendAction: (orderId: string, body: string) => Promise<SendResult>;
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

function addUnique(
  prev: ChatMessagePayload[],
  incoming: ChatMessagePayload[],
): ChatMessagePayload[] {
  const ids = new Set(prev.map((m) => m.id));
  const news = incoming.filter((m) => !ids.has(m.id));
  return news.length ? [...prev, ...news] : prev;
}

export function OrderRealtimeChat({ orderId, initialMessages, myRole, sendAction }: Props) {
  const [messages, setMessages] = useState<ChatMessagePayload[]>(initialMessages);
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastSeenRef = useRef<string>(
    initialMessages.length > 0
      ? initialMessages[initialMessages.length - 1].createdAt
      : new Date(0).toISOString(),
  );

  // Fetch messages newer than lastSeenRef from our API
  const fetchNew = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/orders/${orderId}/messages?after=${encodeURIComponent(lastSeenRef.current)}`,
      );
      if (!res.ok) return;
      const data = (await res.json()) as { messages: ChatMessagePayload[] };
      if (data.messages.length > 0) {
        lastSeenRef.current = data.messages[data.messages.length - 1].createdAt;
        setMessages((prev) => addUnique(prev, data.messages));
      }
    } catch {
      // network issue — will retry on next insert event
    }
  }, [orderId]);

  // Subscribe to Postgres Changes on OrderMessage table.
  // When a new row is inserted for this order, fetch the full message (with author) via API.
  // Zero DB queries between messages — only fires on actual inserts.
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    const channel = supabase
      .channel(`order-messages:${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'OrderMessage',
          filter: `orderId=eq.${orderId}`,
        },
        () => {
          // Payload has raw DB row — fetch formatted version (with author role/label) from our API
          void fetchNew();
        },
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // Fetch any messages that arrived between SSR and subscription
          void fetchNew();
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [orderId, fetchNew]);

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSend() {
    const trimmed = body.trim();
    if (!trimmed) return;
    setError('');
    setBody('');

    startTransition(async () => {
      const result = await sendAction(orderId, trimmed);
      if (result.ok) {
        setMessages((prev) => addUnique(prev, [result.message]));
        lastSeenRef.current = result.message.createdAt;
      } else {
        setBody(trimmed);
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
      <div className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-app-border bg-app-surface p-4 shadow-soft min-h-[120px]">
        {messages.length === 0 ? (
          <p className="text-sm text-app-muted">Повідомлень поки немає.</p>
        ) : (
          messages.map((msg) => {
            const mine = isMyMessage(msg.authorRole, myRole);
            return (
              <div
                key={msg.id}
                className={`flex flex-col gap-1 ${mine ? 'items-end' : 'items-start'}`}
              >
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
