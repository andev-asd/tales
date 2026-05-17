type OrderStatusBadgeProps = {
  label: string;
};

export function OrderStatusBadge({ label }: OrderStatusBadgeProps) {
  return (
    <span className="inline-flex rounded-full bg-[rgba(47,64,88,0.12)] px-3 py-1 text-xs font-medium text-app-premium">
      {label}
    </span>
  );
}
