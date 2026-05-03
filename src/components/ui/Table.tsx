import { clsx } from "clsx";

export function Table({ className, children }: { className?: string; children: React.ReactNode }) {
  return <table className={clsx("min-w-full text-left text-sm text-slate-700", className)}>{children}</table>;
}

export function THead({ children }: { children: React.ReactNode }) {
  return <thead className="border-b border-slate-200 bg-slate-50 text-sm font-semibold text-slate-800">{children}</thead>;
}

export function TBody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function TR({ children, className }: { children: React.ReactNode; className?: string }) {
  return <tr className={clsx("border-b border-slate-200 hover:bg-slate-50", className)}>{children}</tr>;
}

export function TH({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={clsx("px-3 py-2", className)}>{children}</th>;
}

export function TD({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={clsx("px-3 py-2", className)}>{children}</td>;
}
