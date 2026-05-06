import type { HTMLAttributes } from "react";
import { clsx } from "clsx";

export function Card({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-secondary/15 bg-white p-5 shadow-sm shadow-primary/5 transition-shadow duration-200 hover:shadow-md",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
