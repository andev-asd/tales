type BadgeProps = {
  children: React.ReactNode;
  className?: string;
};

export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex rounded-full bg-[rgba(184,101,73,0.12)] px-3 py-1 text-xs font-medium text-[var(--accent-primary)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  );
}
