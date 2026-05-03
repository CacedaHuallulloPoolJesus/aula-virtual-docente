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
    default: "bg-primary/10 text-primary ring-1 ring-primary/15",
    success: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200/80",
    warning: "bg-accent/25 text-primary ring-1 ring-accent/40",
    danger: "bg-danger/12 text-danger ring-1 ring-danger/25",
    muted: "bg-slate-200 text-slate-700 ring-1 ring-slate-300/60",
  };
  return (
    <span className={clsx("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", styles[variant], className)}>
      {children}
    </span>
  );
}
