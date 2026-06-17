interface BadgeProps {
  variant: "active" | "suspended" | "expired" | "cancelled" | "earn" | "redeem" | "adjust" | "expire" | "bonus";
  children: string;
}

export function Badge({ variant, children }: BadgeProps) {
  return <span className={`badge badge-${variant}`}>{children}</span>;
}
