type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea(props: TextareaProps) {
  return (
    <textarea
      {...props}
      className="rounded-[var(--radius-md)] border border-app-border bg-app-elevated px-4 py-3 text-app-text outline-none placeholder:text-app-muted"
    />
  );
}
