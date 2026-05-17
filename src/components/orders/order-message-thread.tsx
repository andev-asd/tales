type Message = {
  id: string;
  authorLabel: string;
  body: string;
  createdAt: string;
};

export function OrderMessageThread({ messages }: { messages: Message[] }) {
  if (messages.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-app-border bg-app-surface p-6 text-app-secondary shadow-soft">
        Повідомлень поки немає.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className="rounded-[var(--radius-lg)] border border-app-border bg-app-surface p-5 shadow-soft"
        >
          <div className="mb-2 text-xs uppercase tracking-[0.18em] text-app-muted">
            {message.authorLabel}
          </div>
          <p className="leading-7 text-app-text">{message.body}</p>
          <div className="mt-3 text-xs text-app-muted">{message.createdAt}</div>
        </div>
      ))}
    </div>
  );
}
