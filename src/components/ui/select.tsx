type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export function Select(props: SelectProps) {
  return (
    <select
      {...props}
      className="rounded-[var(--radius-md)] border border-app-border bg-app-elevated px-4 py-3 text-app-text outline-none"
    />
  );
}
