import { clsx } from "clsx";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "success" | "warning" | "purple" | "accent";
};

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  const styles = {
    primary:
      "bg-primary text-white shadow-sm hover:brightness-110 active:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
    secondary:
      "bg-secondary text-white shadow-sm hover:brightness-110 active:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/40",
    danger: "bg-danger text-white shadow-sm hover:brightness-110 active:brightness-95",
    success: "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 active:bg-emerald-800",
    warning:
      "bg-accent text-primary shadow-sm hover:brightness-95 active:brightness-90 ring-1 ring-primary/10",
    accent:
      "bg-accent text-primary font-semibold shadow-sm hover:brightness-95 active:brightness-90 ring-1 ring-primary/15",
    purple: "bg-secondary text-white shadow-sm hover:brightness-110 active:brightness-95",
  };

  return (
    <button
      className={clsx(
        "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0",
        styles[variant],
        className,
      )}
      {...props}
    />
  );
}
