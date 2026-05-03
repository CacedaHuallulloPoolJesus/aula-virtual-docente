import { clsx } from "clsx";

export function Table({ className, children }: { className?: string; children: React.ReactNode }) {
  return <table className={clsx("min-w-full text-left text-sm text-foreground/90", className)}>{children}</table>;
}

export function THead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="border-b border-secondary/30 bg-secondary text-sm font-semibold text-white [&_th]:text-white">
      {children}
    </thead>
  );
}

export function TBody({ children }: { children: React.ReactNode }) {
  return <tbody className="[&>tr:nth-child(even)]:bg-primary/[0.03]">{children}</tbody>;
}

export function TR({ children, className }: { children: React.ReactNode; className?: string }) {
  return <tr className={clsx("border-b border-secondary/10 transition-colors hover:bg-cream/50", className)}>{children}</tr>;
}

export function TH({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={clsx("px-3 py-2.5", className)}>{children}</th>;
}

export function TD({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={clsx("px-3 py-2", className)}>{children}</td>;
}
