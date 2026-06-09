import { cn } from '@/src/lib/utils';

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      {...props}
      className={cn(
        'rounded-[var(--radius-md)] border border-app-border bg-app-elevated px-4 py-3 text-app-text outline-none placeholder:text-app-muted',
        className,
      )}
    />
  );
}
