import { clsx } from "clsx";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "muted";

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  const styles: Record<BadgeVariant, string> = {
    default: "bg-blue-50 text-blue-800 ring-1 ring-blue-100",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-800",
    danger: "bg-rose-100 text-rose-800",
    muted: "bg-slate-200 text-slate-700",
  };
  return (
    <span className={clsx("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", styles[variant], className)}>
      {children}
    </span>
  );
}
